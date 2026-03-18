'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Detect device type from user agent
 */
function detectDeviceType(): string {
    if (typeof navigator === 'undefined') return 'desktop'
    const ua = navigator.userAgent.toLowerCase()
    if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet'
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
    return 'desktop'
}

/**
 * Hook to track quotation portal views
 * 
 * Automatically:
 * - Starts a view session on mount
 * - Pings every 10s with duration + scroll depth
 * - Pauses tracking when tab is hidden
 * - Provides trackInteraction() for manual events
 */
export function useQuotationTracking(quotationId: string) {
    const viewIdRef = useRef<string | null>(null)
    const sessionIdRef = useRef<string>('')
    const startTimeRef = useRef<number>(0)
    const activeTimeRef = useRef<number>(0)
    const isVisibleRef = useRef<boolean>(true)
    const lastTickRef = useRef<number>(0)
    const maxScrollRef = useRef<number>(0)

    // Calculate current scroll percentage
    const getScrollPercent = useCallback(() => {
        if (typeof document === 'undefined') return 0
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        if (scrollHeight <= 0) return 100
        return Math.min(Math.round((scrollTop / scrollHeight) * 100), 100)
    }, [])

    // Send tracking request
    const sendTracking = useCallback(async (data: Record<string, unknown>) => {
        try {
            await fetch('/api/quote-tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        } catch {
            // Silent fail — tracking should never break the UX
        }
    }, [])

    // Track a user interaction (e.g., print, accept, reject)
    const trackInteraction = useCallback((interactionType: string, details?: Record<string, unknown>) => {
        if (!viewIdRef.current) return
        sendTracking({
            action: 'interaction',
            viewId: viewIdRef.current,
            interactionType,
            details
        })
    }, [sendTracking])

    useEffect(() => {
        // Generate a unique session ID for this tab
        sessionIdRef.current = crypto.randomUUID()
        startTimeRef.current = Date.now()
        lastTickRef.current = Date.now()

        // 1. Start the view
        const startView = async () => {
            try {
                const res = await fetch('/api/quote-tracking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'start',
                        quotationId,
                        sessionId: sessionIdRef.current,
                        userAgent: navigator.userAgent,
                        referrer: document.referrer || null,
                        deviceType: detectDeviceType()
                    })
                })
                const data = await res.json()
                if (data.viewId) {
                    viewIdRef.current = data.viewId
                }
            } catch {
                // Silent fail
            }
        }

        startView()

        // 2. Track scroll depth
        const handleScroll = () => {
            const percent = getScrollPercent()
            if (percent > maxScrollRef.current) {
                maxScrollRef.current = percent
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        // 3. Track visibility changes (pause when tab hidden)
        const handleVisibility = () => {
            if (document.hidden) {
                // Tab hidden — accumulate active time
                activeTimeRef.current += (Date.now() - lastTickRef.current)
                isVisibleRef.current = false
            } else {
                // Tab visible again
                lastTickRef.current = Date.now()
                isVisibleRef.current = true
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)

        // 4. Ping every 10 seconds
        const pingInterval = setInterval(() => {
            if (!viewIdRef.current) return

            let totalActive = activeTimeRef.current
            if (isVisibleRef.current) {
                totalActive += (Date.now() - lastTickRef.current)
            }

            const durationSeconds = Math.round(totalActive / 1000)

            sendTracking({
                action: 'ping',
                viewId: viewIdRef.current,
                durationSeconds,
                maxScrollPercent: maxScrollRef.current
            })
        }, 10000)

        // 5. Final ping on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('visibilitychange', handleVisibility)
            clearInterval(pingInterval)

            if (viewIdRef.current) {
                let totalActive = activeTimeRef.current
                if (isVisibleRef.current) {
                    totalActive += (Date.now() - lastTickRef.current)
                }

                // Use sendBeacon for reliable last ping
                const payload = JSON.stringify({
                    action: 'ping',
                    viewId: viewIdRef.current,
                    durationSeconds: Math.round(totalActive / 1000),
                    maxScrollPercent: maxScrollRef.current
                })

                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/quote-tracking', new Blob([payload], { type: 'application/json' }))
                } else {
                    fetch('/api/quote-tracking', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                        keepalive: true
                    }).catch(() => { })
                }
            }
        }
    }, [quotationId, getScrollPercent, sendTracking])

    return { trackInteraction }
}
