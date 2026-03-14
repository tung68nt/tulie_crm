'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAction,
} from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/shared/status-badge'
import { TEXT } from '@/lib/design-system/tokens/typography'
import { STATUS_COLORS, BRAND_BADGE_COLORS, BG_COLORS } from '@/lib/design-system/tokens/colors'
import { PAGE, CARD, FORM, LIST, INLINE, STAT, DETAIL } from '@/lib/design-system/tokens/spacing'
import { THEME } from '@/lib/design-system/theme'
import {
    CUSTOMER_STATUS_LABELS,
    QUOTATION_STATUS_LABELS,
    CONTRACT_STATUS_LABELS,
    INVOICE_STATUS_LABELS,
    DEAL_STATUS_LABELS,
    PROJECT_STATUS_LABELS,
    PRODUCT_STATUS_LABELS,
    BRAND_LABELS,
    TICKET_STATUS_LABELS,
    TICKET_PRIORITY_LABELS,
} from '@/lib/constants/status'
import {
    Plus,
    Search,
    Download,
    Trash2,
    Edit,
    MoreHorizontal,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Info,
    Sun,
    Moon,
    Copy,
    Mail,
    Settings,
    User,
    ArrowLeft,
    Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Sections ────────────────────────────────────────────────────────────────

const SECTIONS = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'badges', label: 'Badges' },
    { id: 'forms', label: 'Forms' },
    { id: 'cards', label: 'Cards' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'tables', label: 'Tables' },
    { id: 'dialogs', label: 'Dialogs & Sheets' },
    { id: 'misc', label: 'Misc' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ id, title, description }: { id: string; title: string; description: string }) {
    return (
        <div id={id} className="scroll-mt-20 space-y-1 pt-8 first:pt-0">
            <h2 className={cn(TEXT.pageTitle)}>{title}</h2>
            <p className={cn(TEXT.pageDescription)}>{description}</p>
            <Separator className="mt-4" />
        </div>
    )
}

function ComponentBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className={cn(TEXT.sectionTitle)}>{title}</h3>
            <div className="rounded-lg border p-6 bg-card">{children}</div>
        </div>
    )
}

function CodeToken({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{label}</code>
            <span className="text-muted-foreground">{value}</span>
        </div>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
    const [darkMode, setDarkMode] = useState(false)

    const toggleDark = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle('dark')
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                {/* Top Bar */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold tracking-tight">Tulie CRM — UI Components</h1>
                            <Badge variant="secondary">v1.0</Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={toggleDark}>
                            {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </Button>
                    </div>
                </header>

                <div className="flex">
                    {/* Sidebar Navigation */}
                    <nav className="hidden lg:block w-56 shrink-0 border-r sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4">
                        <ul className="space-y-1">
                            {SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        {section.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Main Content */}
                    <main className="flex-1 max-w-5xl mx-auto px-6 py-8 space-y-12">

                        {/* ═══════════════════ 1. COLORS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="colors"
                                title="Colors"
                                description="Zinc monochrome palette — dùng CSS variables từ shadcn/ui. Chỉ dùng destructive (red) cho errors."
                            />
                            <div className="mt-6 space-y-6">
                                {/* CSS Variables */}
                                <ComponentBlock title="CSS Variable Colors">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {[
                                            { name: '--primary', label: 'Primary', cls: 'bg-primary' },
                                            { name: '--primary-foreground', label: 'Primary FG', cls: 'bg-primary-foreground border' },
                                            { name: '--secondary', label: 'Secondary', cls: 'bg-secondary' },
                                            { name: '--muted', label: 'Muted', cls: 'bg-muted' },
                                            { name: '--accent', label: 'Accent', cls: 'bg-accent' },
                                            { name: '--destructive', label: 'Destructive', cls: 'bg-destructive' },
                                            { name: '--border', label: 'Border', cls: 'bg-border' },
                                            { name: '--input', label: 'Input', cls: 'bg-input' },
                                            { name: '--ring', label: 'Ring', cls: 'bg-ring' },
                                            { name: '--card', label: 'Card', cls: 'bg-card border' },
                                            { name: '--popover', label: 'Popover', cls: 'bg-popover border' },
                                            { name: '--background', label: 'Background', cls: 'bg-background border' },
                                        ].map((c) => (
                                            <div key={c.name} className="space-y-2">
                                                <div className={cn('h-12 rounded-md', c.cls)} />
                                                <p className="text-xs font-medium">{c.label}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{c.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ComponentBlock>

                                {/* Status Colors */}
                                <ComponentBlock title="Semantic Status Colors (from tokens/colors.ts)">
                                    <div className="flex flex-wrap gap-3">
                                        {(Object.entries(STATUS_COLORS) as [string, { bg: string; text: string; dot: string }][]).map(([key, val]) => (
                                            <div key={key} className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium', val.bg, val.text)}>
                                                <span className={cn('size-2 rounded-full', val.dot)} />
                                                {key}
                                            </div>
                                        ))}
                                    </div>
                                </ComponentBlock>

                                {/* Background Utilities */}
                                <ComponentBlock title="Background Utilities (BG_COLORS)">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {Object.entries(BG_COLORS).map(([key, cls]) => (
                                            <div key={key} className={cn('h-16 rounded-md flex items-center justify-center text-xs font-medium border', cls)}>
                                                {key}
                                            </div>
                                        ))}
                                    </div>
                                </ComponentBlock>

                                {/* Brand Badge Colors */}
                                <ComponentBlock title="Brand Badge Colors">
                                    <div className="flex gap-3">
                                        {Object.entries(BRAND_BADGE_COLORS).map(([key, cls]) => (
                                            <span key={key} className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', cls)}>
                                                {key}
                                            </span>
                                        ))}
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 2. TYPOGRAPHY ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="typography"
                                title="Typography"
                                description="Text styles từ tokens/typography.ts — Inter font, KHÔNG uppercase, max font-bold (700)."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Text Styles (TEXT tokens)">
                                    <div className="space-y-4">
                                        {Object.entries(TEXT).map(([key, cls]) => (
                                            <div key={key} className="flex items-baseline gap-4">
                                                <code className="w-40 shrink-0 text-xs font-mono text-muted-foreground">{key}</code>
                                                <span className={cn(cls)}>Tulie CRM — Quản lý khách hàng</span>
                                            </div>
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Font Weight Reference">
                                    <div className="space-y-2">
                                        <p className="font-normal text-sm">font-normal (400) — Body text</p>
                                        <p className="font-medium text-sm">font-medium (500) — Labels, nav items</p>
                                        <p className="font-semibold text-sm">font-semibold (600) — Card titles, section titles</p>
                                        <p className="font-bold text-sm">font-bold (700) — Page titles, stat values</p>
                                        <p className="font-black text-sm text-muted-foreground line-through">font-black (900) — ❌ KHÔNG DÙNG trong dashboard</p>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Font Size Scale">
                                    <div className="space-y-2">
                                        <p className="text-xs">text-xs (12px) — Captions, badges, meta</p>
                                        <p className="text-sm">text-sm (14px) — Body, labels, most content</p>
                                        <p className="text-base">text-base (16px) — Slightly larger body</p>
                                        <p className="text-lg">text-lg (18px) — Section titles</p>
                                        <p className="text-xl">text-xl (20px) — Sub-page titles</p>
                                        <p className="text-2xl">text-2xl (24px) — Page titles</p>
                                        <p className="text-3xl">text-3xl (30px) — Hero stats</p>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 3. SPACING ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="spacing"
                                title="Spacing"
                                description="Layout tokens từ tokens/spacing.ts — gap, padding, grid patterns."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Layout Tokens">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">PAGE</h4>
                                            <div className="space-y-1">
                                                {Object.entries(PAGE).map(([k, v]) => <CodeToken key={k} label={`PAGE.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">CARD</h4>
                                            <div className="space-y-1">
                                                {Object.entries(CARD).map(([k, v]) => <CodeToken key={k} label={`CARD.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">FORM</h4>
                                            <div className="space-y-1">
                                                {Object.entries(FORM).map(([k, v]) => <CodeToken key={k} label={`FORM.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">INLINE</h4>
                                            <div className="space-y-1">
                                                {Object.entries(INLINE).map(([k, v]) => <CodeToken key={k} label={`INLINE.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">STAT</h4>
                                            <div className="space-y-1">
                                                {Object.entries(STAT).map(([k, v]) => <CodeToken key={k} label={`STAT.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">DETAIL</h4>
                                            <div className="space-y-1">
                                                {Object.entries(DETAIL).map(([k, v]) => <CodeToken key={k} label={`DETAIL.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Theme Tokens (THEME)">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Radius</h4>
                                            <div className="space-y-1">
                                                {Object.entries(THEME.radius).map(([k, v]) => <CodeToken key={k} label={`THEME.radius.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Shadow</h4>
                                            <div className="space-y-1">
                                                {Object.entries(THEME.shadow).map(([k, v]) => <CodeToken key={k} label={`THEME.shadow.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Size</h4>
                                            <div className="space-y-1">
                                                {Object.entries(THEME.size).map(([k, v]) => <CodeToken key={k} label={`THEME.size.${k}`} value={v} />)}
                                            </div>
                                        </div>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 4. BUTTONS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="buttons"
                                title="Buttons"
                                description="6 variants × 6 sizes — shadcn/ui Button component."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Variants">
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="default">Default</Button>
                                        <Button variant="secondary">Secondary</Button>
                                        <Button variant="outline">Outline</Button>
                                        <Button variant="ghost">Ghost</Button>
                                        <Button variant="link">Link</Button>
                                        <Button variant="destructive">Destructive</Button>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Sizes">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button size="sm">Small</Button>
                                        <Button size="default">Default</Button>
                                        <Button size="lg">Large</Button>
                                        <Button size="icon"><Plus className="size-4" /></Button>
                                        <Button size="icon-sm"><Plus className="size-4" /></Button>
                                        <Button size="icon-lg"><Plus className="size-4" /></Button>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="With Icons">
                                    <div className="flex flex-wrap gap-3">
                                        <Button><Plus /> Tạo mới</Button>
                                        <Button variant="outline"><Download /> Tải xuống</Button>
                                        <Button variant="secondary"><Search /> Tìm kiếm</Button>
                                        <Button variant="destructive"><Trash2 /> Xoá</Button>
                                        <Button variant="ghost"><Edit /> Sửa</Button>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="States">
                                    <div className="flex flex-wrap gap-3">
                                        <Button>Active</Button>
                                        <Button disabled>Disabled</Button>
                                        <Button variant="outline">Focus me</Button>
                                        <Button variant="outline" disabled>Outline Disabled</Button>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Full Matrix (Variant × Size)">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Variant</th>
                                                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">sm</th>
                                                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">default</th>
                                                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">lg</th>
                                                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">icon</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const).map((variant) => (
                                                    <tr key={variant} className="border-b last:border-0">
                                                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{variant}</td>
                                                        <td className="py-3 px-2"><Button variant={variant} size="sm">Btn</Button></td>
                                                        <td className="py-3 px-2"><Button variant={variant} size="default">Button</Button></td>
                                                        <td className="py-3 px-2"><Button variant={variant} size="lg">Button</Button></td>
                                                        <td className="py-3 px-2"><Button variant={variant} size="icon"><Plus /></Button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 5. BADGES ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="badges"
                                title="Badges & Status"
                                description="Badge variants + StatusBadge cho tất cả entity types."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Badge Variants (shadcn)">
                                    <div className="flex flex-wrap gap-3">
                                        <Badge variant="default">Default</Badge>
                                        <Badge variant="secondary">Secondary</Badge>
                                        <Badge variant="outline">Outline</Badge>
                                        <Badge variant="destructive">Destructive</Badge>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Customer">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(CUSTOMER_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="customer" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Quotation">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(QUOTATION_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="quotation" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Contract">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(CONTRACT_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="contract" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Invoice">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(INVOICE_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="invoice" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Deal">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(DEAL_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="deal" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Project">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="project" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Product">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PRODUCT_STATUS_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="product" />
                                        ))}
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="StatusBadge — Brand">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(BRAND_LABELS).map(([status, label]) => (
                                            <StatusBadge key={status} status={status} label={label} entityType="brand" />
                                        ))}
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 6. FORMS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="forms"
                                title="Forms"
                                description="Input, Textarea, Select, Checkbox, Switch, RadioGroup, Label."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Input">
                                    <div className="max-w-md space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="demo-name">Tên khách hàng</Label>
                                            <Input id="demo-name" placeholder="Nhập tên..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="demo-search">Tìm kiếm</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input id="demo-search" className="pl-9" placeholder="Tìm khách hàng..." />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="demo-disabled">Disabled</Label>
                                            <Input id="demo-disabled" placeholder="Không thể nhập" disabled />
                                        </div>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Textarea">
                                    <div className="max-w-md space-y-2">
                                        <Label htmlFor="demo-textarea">Ghi chú</Label>
                                        <Textarea id="demo-textarea" placeholder="Nhập ghi chú..." rows={3} />
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Select">
                                    <div className="max-w-md space-y-2">
                                        <Label>Trạng thái</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lead">Tiềm năng</SelectItem>
                                                <SelectItem value="prospect">Đang theo dõi</SelectItem>
                                                <SelectItem value="customer">Khách hàng</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Checkbox & Switch">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="demo-check" />
                                            <Label htmlFor="demo-check">Đánh dấu quan trọng</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="demo-check2" checked disabled />
                                            <Label htmlFor="demo-check2" className="text-muted-foreground">Checked & Disabled</Label>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center space-x-2">
                                            <Switch id="demo-switch" />
                                            <Label htmlFor="demo-switch">Bật thông báo</Label>
                                        </div>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="RadioGroup">
                                    <RadioGroup defaultValue="email" className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="email" id="r-email" />
                                            <Label htmlFor="r-email">Email</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="phone" id="r-phone" />
                                            <Label htmlFor="r-phone">Điện thoại</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="zalo" id="r-zalo" />
                                            <Label htmlFor="r-zalo">Zalo</Label>
                                        </div>
                                    </RadioGroup>
                                </ComponentBlock>

                                <ComponentBlock title="Form Layout Grid (FORM tokens)">
                                    <div className={FORM.gridCols2}>
                                        <div className="space-y-2">
                                            <Label>Họ tên</Label>
                                            <Input placeholder="Nguyễn Văn A" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input type="email" placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số điện thoại</Label>
                                            <Input placeholder="0123 456 789" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Công ty</Label>
                                            <Input placeholder="Tên công ty" />
                                        </div>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 7. CARDS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="cards"
                                title="Cards"
                                description="Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Basic Card">
                                    <div className="max-w-md">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Thông tin khách hàng</CardTitle>
                                                <CardDescription>Quản lý thông tin liên hệ</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">Nội dung card hiển thị ở đây.</p>
                                            </CardContent>
                                            <CardFooter className="gap-2">
                                                <Button size="sm">Lưu</Button>
                                                <Button size="sm" variant="outline">Hủy</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Card with Action">
                                    <div className="max-w-md">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Danh sách báo giá</CardTitle>
                                                <CardDescription>3 báo giá đang chờ duyệt</CardDescription>
                                                <CardAction>
                                                    <Button size="sm" variant="outline"><Plus className="size-4" /> Tạo mới</Button>
                                                </CardAction>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">Danh sách hiển thị ở đây...</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Stat Cards (Dashboard)">
                                    <div className={STAT.grid}>
                                        {[
                                            { label: 'Tổng khách hàng', value: '1,234', trend: '+12%' },
                                            { label: 'Đang theo dõi', value: '56', trend: '+5%' },
                                            { label: 'Báo giá mới', value: '12', trend: '-2%' },
                                            { label: 'Doanh thu tháng', value: '450M', trend: '+18%' },
                                        ].map((stat) => (
                                            <Card key={stat.label}>
                                                <CardContent className="p-6">
                                                    <p className={TEXT.statLabel}>{stat.label}</p>
                                                    <p className={cn(TEXT.statValue, 'mt-1')}>{stat.value}</p>
                                                    <p className={cn(TEXT.statTrend, 'mt-1', stat.trend.startsWith('+') ? 'text-foreground' : 'text-muted-foreground')}>
                                                        {stat.trend} so với tháng trước
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 8. ALERTS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="alerts"
                                title="Alerts"
                                description="Alert component — default + destructive variants."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Default Alert">
                                    <Alert>
                                        <Info className="size-4" />
                                        <AlertTitle>Thông báo</AlertTitle>
                                        <AlertDescription>
                                            Có 3 báo giá mới cần duyệt trong hôm nay.
                                        </AlertDescription>
                                    </Alert>
                                </ComponentBlock>

                                <ComponentBlock title="Destructive Alert">
                                    <Alert variant="destructive">
                                        <AlertCircle className="size-4" />
                                        <AlertTitle>Lỗi</AlertTitle>
                                        <AlertDescription>
                                            Không thể kết nối đến server. Vui lòng thử lại sau.
                                        </AlertDescription>
                                    </Alert>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 9. TABLES ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="tables"
                                title="Tables"
                                description="Data table pattern — header, rows, cells."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Basic Table">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tên khách hàng</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Trạng thái</TableHead>
                                                    <TableHead>Brand</TableHead>
                                                    <TableHead className="text-right">Doanh thu</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[
                                                    { name: 'Nguyễn Văn A', email: 'a@example.com', status: 'customer', brand: 'agency', revenue: '120,000,000đ' },
                                                    { name: 'Trần Thị B', email: 'b@example.com', status: 'vip', brand: 'studio', revenue: '350,000,000đ' },
                                                    { name: 'Lê Văn C', email: 'c@example.com', status: 'lead', brand: 'academy', revenue: '0đ' },
                                                    { name: 'Phạm Thị D', email: 'd@example.com', status: 'prospect', brand: 'agency', revenue: '15,000,000đ' },
                                                    { name: 'Hoàng Văn E', email: 'e@example.com', status: 'churned', brand: 'studio', revenue: '80,000,000đ' },
                                                ].map((row) => (
                                                    <TableRow key={row.name}>
                                                        <TableCell className="font-medium">{row.name}</TableCell>
                                                        <TableCell className="text-muted-foreground">{row.email}</TableCell>
                                                        <TableCell><StatusBadge status={row.status} entityType="customer" /></TableCell>
                                                        <TableCell><StatusBadge status={row.brand} entityType="brand" /></TableCell>
                                                        <TableCell className="text-right font-medium">{row.revenue}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 10. DIALOGS & SHEETS ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="dialogs"
                                title="Dialogs & Sheets"
                                description="Modal dialog, Sheet (slide-out panel)."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Dialog">
                                    <div className="flex gap-3">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline">Mở Dialog</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Xác nhận xoá</DialogTitle>
                                                    <DialogDescription>
                                                        Bạn có chắc chắn muốn xoá khách hàng này? Hành động này không thể hoàn tác.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="outline">Hủy</Button>
                                                    <Button variant="destructive">Xoá</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button>Dialog Form</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Tạo khách hàng mới</DialogTitle>
                                                    <DialogDescription>Nhập thông tin khách hàng</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Tên</Label>
                                                        <Input placeholder="Nguyễn Văn A" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input type="email" placeholder="email@example.com" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline">Hủy</Button>
                                                    <Button>Tạo mới</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Sheet">
                                    <div className="flex gap-3">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline">Mở Sheet (phải)</Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Chi tiết khách hàng</SheetTitle>
                                                    <SheetDescription>Xem và chỉnh sửa thông tin</SheetDescription>
                                                </SheetHeader>
                                                <div className="space-y-4 py-6">
                                                    <div className="space-y-2">
                                                        <Label>Tên</Label>
                                                        <Input defaultValue="Nguyễn Văn A" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input defaultValue="a@example.com" />
                                                    </div>
                                                </div>
                                                <SheetFooter>
                                                    <Button>Lưu thay đổi</Button>
                                                </SheetFooter>
                                            </SheetContent>
                                        </Sheet>

                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline">Mở Sheet (trái)</Button>
                                            </SheetTrigger>
                                            <SheetContent side="left">
                                                <SheetHeader>
                                                    <SheetTitle>Bộ lọc</SheetTitle>
                                                    <SheetDescription>Lọc danh sách khách hàng</SheetDescription>
                                                </SheetHeader>
                                                <div className="py-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Trạng thái</Label>
                                                        <Select>
                                                            <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Tất cả</SelectItem>
                                                                <SelectItem value="customer">Khách hàng</SelectItem>
                                                                <SelectItem value="lead">Tiềm năng</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* ═══════════════════ 11. MISC ═══════════════════ */}
                        <section>
                            <SectionHeader
                                id="misc"
                                title="Misc Components"
                                description="Tabs, Tooltip, Popover, Avatar, Skeleton, Progress, Separator, ScrollArea."
                            />
                            <div className="mt-6 space-y-6">
                                <ComponentBlock title="Tabs">
                                    <Tabs defaultValue="info" className="max-w-md">
                                        <TabsList>
                                            <TabsTrigger value="info">Thông tin</TabsTrigger>
                                            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                                            <TabsTrigger value="history">Lịch sử</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="info" className="text-sm text-muted-foreground py-4">
                                            Nội dung tab Thông tin hiển thị ở đây.
                                        </TabsContent>
                                        <TabsContent value="orders" className="text-sm text-muted-foreground py-4">
                                            Nội dung tab Đơn hàng hiển thị ở đây.
                                        </TabsContent>
                                        <TabsContent value="history" className="text-sm text-muted-foreground py-4">
                                            Nội dung tab Lịch sử hiển thị ở đây.
                                        </TabsContent>
                                    </Tabs>
                                </ComponentBlock>

                                <ComponentBlock title="Tooltip">
                                    <div className="flex gap-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon"><Copy className="size-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Sao chép</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon"><Mail className="size-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Gửi email</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon"><Settings className="size-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Cài đặt</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Popover">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">Mở Popover</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-sm">Tuỳ chỉnh hiển thị</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="pop-1" />
                                                    <Label htmlFor="pop-1" className="text-sm">Hiện cột email</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="pop-2" defaultChecked />
                                                    <Label htmlFor="pop-2" className="text-sm">Hiện cột trạng thái</Label>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </ComponentBlock>

                                <ComponentBlock title="Avatar">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>TN</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarFallback>AB</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="size-12">
                                            <AvatarFallback className="text-lg">VN</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="size-8">
                                            <AvatarFallback className="text-xs">SM</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Skeleton">
                                    <div className="space-y-3 max-w-md">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-10 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-32 w-full rounded-lg" />
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Progress">
                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Tiến độ dự án</span>
                                                <span className="text-muted-foreground">75%</span>
                                            </div>
                                            <Progress value={75} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Mục tiêu doanh thu</span>
                                                <span className="text-muted-foreground">35%</span>
                                            </div>
                                            <Progress value={35} />
                                        </div>
                                    </div>
                                </ComponentBlock>

                                <ComponentBlock title="Separator">
                                    <div className="space-y-4 max-w-md">
                                        <p className="text-sm">Nội dung phía trên</p>
                                        <Separator />
                                        <p className="text-sm">Nội dung phía dưới</p>
                                        <div className="flex items-center gap-4 h-5">
                                            <span className="text-sm">Item 1</span>
                                            <Separator orientation="vertical" />
                                            <span className="text-sm">Item 2</span>
                                            <Separator orientation="vertical" />
                                            <span className="text-sm">Item 3</span>
                                        </div>
                                    </div>
                                </ComponentBlock>
                            </div>
                        </section>

                        {/* Footer */}
                        <div className="border-t pt-8 pb-16">
                            <p className="text-sm text-muted-foreground text-center">
                                Tulie CRM — UI Component Library • shadcn/ui + Zinc Monochrome • Last updated: {new Date().toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    )
}
