'use client'

import { useEffect, useRef, useCallback } from 'react'

function detectDeviceType(): string {
    if (typeof navigator === 'undefined') return 'desktop'
    const ua = navigator.userAgent.toLowerCase()
    if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet'
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
    return 'desktop'
}

interface PortalTrackingParams {
    portalToken: string
    projectId?: string
    customerId?: string
}

/**
 * Hook to track portal page views
 * 
 * Similar to useQuotationTracking but for the customer portal.
 * Also tracks which sections/pages the user visits within the portal.
 */
export function usePortalTracking({ portalToken, projectId, customerId }: PortalTrackingParams) {
    const viewIdRef = useRef<string | null>(null)
    const sessionIdRef = useRef<string>('')
    const activeTimeRef = useRef<number>(0)
    const isVisibleRef = useRef<boolean>(true)
    const lastTickRef = useRef<number>(0)
    const maxScrollRef = useRef<number>(0)

    const getScrollPercent = useCallback(() => {
        if (typeof document === 'undefined') return 0
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        if (scrollHeight <= 0) return 100
        return Math.min(Math.round((scrollTop / scrollHeight) * 100), 100)
    }, [])

    const sendTracking = useCallback(async (data: Record<string, unknown>) => {
        try {
            await fetch('/api/portal-tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        } catch {
            // Silent fail
        }
    }, [])

    const trackInteraction = useCallback((interactionType: string, details?: Record<string, unknown>) => {
        if (!viewIdRef.current) return
        sendTracking({
            action: 'interaction',
            viewId: viewIdRef.current,
            interactionType,
            details
        })
    }, [sendTracking])

    const trackPageView = useCallback((pageName: string) => {
        if (!viewIdRef.current) return
        sendTracking({
            action: 'page',
            viewId: viewIdRef.current,
            pageName
        })
    }, [sendTracking])

    useEffect(() => {
        sessionIdRef.current = crypto.randomUUID()
        lastTickRef.current = Date.now()

        const startView = async () => {
            try {
                const res = await fetch('/api/portal-tracking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'start',
                        portalToken,
                        projectId: projectId || null,
                        customerId: customerId || null,
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

        const handleScroll = () => {
            const percent = getScrollPercent()
            if (percent > maxScrollRef.current) {
                maxScrollRef.current = percent
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        const handleVisibility = () => {
            if (document.hidden) {
                activeTimeRef.current += (Date.now() - lastTickRef.current)
                isVisibleRef.current = false
            } else {
                lastTickRef.current = Date.now()
                isVisibleRef.current = true
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)

        const pingInterval = setInterval(() => {
            if (!viewIdRef.current) return

            let totalActive = activeTimeRef.current
            if (isVisibleRef.current) {
                totalActive += (Date.now() - lastTickRef.current)
            }

            sendTracking({
                action: 'ping',
                viewId: viewIdRef.current,
                durationSeconds: Math.round(totalActive / 1000),
                maxScrollPercent: maxScrollRef.current
            })
        }, 10000)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('visibilitychange', handleVisibility)
            clearInterval(pingInterval)

            if (viewIdRef.current) {
                let totalActive = activeTimeRef.current
                if (isVisibleRef.current) {
                    totalActive += (Date.now() - lastTickRef.current)
                }

                const payload = JSON.stringify({
                    action: 'ping',
                    viewId: viewIdRef.current,
                    durationSeconds: Math.round(totalActive / 1000),
                    maxScrollPercent: maxScrollRef.current
                })

                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/portal-tracking', new Blob([payload], { type: 'application/json' }))
                } else {
                    fetch('/api/portal-tracking', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                        keepalive: true
                    }).catch(() => { })
                }
            }
        }
    }, [portalToken, projectId, customerId, getScrollPercent, sendTracking])

    return { trackInteraction, trackPageView }
}
