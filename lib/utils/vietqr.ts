/**
 * VietQR BIN code mapping
 * Maps bank names (as stored in settings) to their VietQR BIN codes.
 * Ref: https://api.vietqr.io/v2/banks
 */
export const BANK_BIN_MAP: Record<string, string> = {
    // Common banks
    'MB': '970422',
    'MBBank': '970422',
    'Techcombank': '970407',
    'TCB': '970407',
    'Vietcombank': '970436',
    'VCB': '970436',
    'BIDV': '970418',
    'VPBank': '970432',
    'ACB': '970416',
    'TPBank': '970423',
    'Sacombank': '970403',
    'STB': '970403',
    'VietinBank': '970415',
    'CTG': '970415',
    'HDBank': '970437',
    'Agribank': '970405',
    'OCB': '970448',
    'SHB': '970443',
    'MSB': '970426',
    'VIB': '970441',
    'SeABank': '970440',
    'LPBank': '970449',
    'Eximbank': '970431',
    'ABBANK': '970423',
    'BacABank': '970409',
    'NamABank': '970428',
    'SCB': '970429',
    'PGBank': '970430',
    'Saigonbank': '970400',
    'BaoVietBank': '970438',
    'NCB': '970419',
    'PublicBank Vietnam': '970439',
    'KienLongBank': '970452',
    'VietABank': '970427',
    'CIMB': '422589',
    'Dong A Bank': '970406',
}

/**
 * Get VietQR BIN code from bank name.
 * If the bank name is already a numeric BIN, returns it as-is.
 */
export function getBankBin(bankName: string): string {
    if (/^\d+$/.test(bankName)) return bankName
    return BANK_BIN_MAP[bankName] || bankName
}

/**
 * Build a VietQR payment URL
 */
export function buildVietQrUrl(params: {
    bankName: string
    accountNo: string
    accountName: string
    amount: number
    addInfo: string
}): string {
    const bin = getBankBin(params.bankName)
    return `https://img.vietqr.io/image/${bin}-${params.accountNo}-compact2.png?amount=${params.amount}&addInfo=${encodeURIComponent(params.addInfo)}&accountName=${encodeURIComponent(params.accountName)}`
}

/**
 * VietQR bank code mapping (for deeplink `app` param)
 * Maps bank names to their VietQR code (used in ba=accountNo@code format)
 */
const BANK_CODE_MAP: Record<string, { app: string; code: string }> = {
    'VietinBank': { app: 'vietinbank', code: 'ICB' },
    'CTG': { app: 'vietinbank', code: 'ICB' },
    'Vietcombank': { app: 'vietcombank', code: 'VCB' },
    'VCB': { app: 'vietcombank', code: 'VCB' },
    'BIDV': { app: 'bidv', code: 'BIDV' },
    'MB': { app: 'mbbank', code: 'MB' },
    'MBBank': { app: 'mbbank', code: 'MB' },
    'Techcombank': { app: 'techcombank', code: 'TCB' },
    'TCB': { app: 'techcombank', code: 'TCB' },
    'ACB': { app: 'acb', code: 'ACB' },
    'VPBank': { app: 'vpbank', code: 'VPB' },
    'TPBank': { app: 'tpbank', code: 'TPB' },
    'Sacombank': { app: 'sacombank', code: 'STB' },
    'STB': { app: 'sacombank', code: 'STB' },
    'HDBank': { app: 'hdbank', code: 'HDB' },
    'Agribank': { app: 'agribank', code: 'VBA' },
    'SHB': { app: 'shb', code: 'SHB' },
    'MSB': { app: 'msb', code: 'MSB' },
    'OCB': { app: 'ocb', code: 'OCB' },
    'VIB': { app: 'vib', code: 'VIB' },
    'SeABank': { app: 'seabank', code: 'SEAB' },
    'LPBank': { app: 'lpbank', code: 'LPB' },
    'Eximbank': { app: 'eximbank', code: 'EIB' },
}

/**
 * Build a VietQR deeplink URL that opens banking apps on mobile
 * Format: https://dl.vietqr.io/pay?app={bankApp}&ba={accountNo}@{bankCode}&am={amount}&tn={content}
 */
export function buildVietQrDeeplink(params: {
    bankName: string
    accountNo: string
    accountName: string
    amount: number
    addInfo: string
}): string {
    const bankInfo = BANK_CODE_MAP[params.bankName]
    const app = bankInfo?.app || params.bankName.toLowerCase()
    const code = bankInfo?.code || params.bankName
    return `https://dl.vietqr.io/pay?app=${app}&ba=${params.accountNo}@${code}&am=${params.amount}&tn=${encodeURIComponent(params.addInfo)}`
}
