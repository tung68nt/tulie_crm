'use client'

import { useState } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Plus, Mail, Phone, User as UserIcon, Trash2, Edit } from 'lucide-react'
import { ContactForm } from './contact-form'
import { deleteContact } from '@/lib/supabase/services/contact-service'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface ContactListProps {
    customerId: string
    initialContacts: Contact[]
}

export function ContactList({ customerId, initialContacts }: ContactListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAdd = () => {
        setSelectedContact(undefined)
        setIsFormOpen(true)
    }

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (contact: Contact) => {
        setContactToDelete(contact)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!contactToDelete) return
        setIsDeleting(true)
        try {
            await deleteContact(contactToDelete.id, customerId)
            toast.success('Xóa liên hệ thành công')
            setDeleteDialogOpen(false)
            setContactToDelete(null)
        } catch (error) {
            console.error('Failed to delete contact:', error)
            toast.error('Có lỗi xảy ra khi xóa liên hệ')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Danh sách liên hệ</CardTitle>
                    </div>
                    <Button size="sm" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {initialContacts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Chưa có thông tin liên hệ chi tiết
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                {initialContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{contact.name}</p>
                                                    {contact.is_primary && (
                                                        <Badge variant="secondary" className="text-[10px] h-4">Chính</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{contact.position || 'Nhân viên'}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                    {contact.email && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{contact.email}</span>
                                                        </div>
                                                    )}
                                                    {contact.phone && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{contact.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(contact)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteClick(contact)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ContactForm
                customerId={customerId}
                contact={selectedContact}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            />

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa liên hệ?</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa liên hệ <strong>{contactToDelete?.name}</strong>? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
