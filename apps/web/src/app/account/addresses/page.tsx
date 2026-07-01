'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '@/lib/hooks/useAddresses'
import type { AddressDTO } from '@/lib/api'

const EMPTY_FORM: Omit<AddressDTO, '_id'> = {
  label: '',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isDefault: false,
}

export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddresses()
  const addAddress = useAddAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<AddressDTO, '_id'>>(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(addr: AddressDTO) {
    setEditId(addr._id ?? null)
    setForm({ ...addr })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await updateAddress.mutateAsync({ id: editId, addr: form })
    } else {
      await addAddress.mutateAsync(form)
    }
    closeForm()
  }

  const isPending = addAddress.isPending || updateAddress.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Addresses</h1>
        {!showForm && (
          <Button size="sm" onClick={openNew}>
            <Plus size={15} className="mr-1.5" aria-hidden="true" />
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 space-y-4"
          aria-label={editId ? 'Edit address' : 'New address'}
        >
          <h2 className="font-semibold">{editId ? 'Edit address' : 'New address'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                ['Full name', 'fullName', 'text', true],
                ['Phone', 'phone', 'tel', true],
                ['Address line 1', 'line1', 'text', true],
                ['Address line 2', 'line2', 'text', false],
                ['City', 'city', 'text', true],
                ['State / Province', 'state', 'text', false],
                ['Postal code', 'postalCode', 'text', true],
                ['Country', 'country', 'text', true],
                ['Label (e.g. Home)', 'label', 'text', false],
              ] as [string, keyof typeof form, string, boolean][]
            ).map(([label, key, type, req]) => (
              <div key={key} className={key === 'line1' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs text-[var(--muted)] mb-1" htmlFor={`addr-${key}`}>
                  {label}
                  {req && <span className="text-danger ml-0.5">*</span>}
                </label>
                <input
                  id={`addr-${key}`}
                  type={type}
                  required={req}
                  value={(form[key] as string) ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet/50"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="accent-violet"
            />
            Set as default address
          </label>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save address'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <EmptyState
          icon={<MapPin size={24} />}
          title="No saved addresses"
          description="Add an address to speed up checkout."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus size={15} className="mr-1.5" />
              Add address
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr._id}
              className={cn(
                'glass rounded-2xl p-5 flex gap-4',
                addr.isDefault && 'ring-1 ring-violet/40'
              )}
            >
              <MapPin size={18} className="mt-0.5 text-violet shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-medium text-sm">{addr.fullName}</p>
                  {addr.label && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--muted)]">
                      {addr.label}
                    </span>
                  )}
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet/15 text-violet flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {addr.city}
                  {addr.state ? `, ${addr.state}` : ''} {addr.postalCode}, {addr.country}
                </p>
                <p className="text-sm text-[var(--muted)]">{addr.phone}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!addr.isDefault && (
                  <button
                    type="button"
                    aria-label="Set as default"
                    onClick={() =>
                      updateAddress.mutate({ id: addr._id!, addr: { isDefault: true } })
                    }
                    className="p-2 rounded-xl hover:bg-white/10 text-[var(--muted)] hover:text-violet transition-colors"
                  >
                    <Star size={15} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Edit address"
                  onClick={() => openEdit(addr)}
                  className="p-2 rounded-xl hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label="Delete address"
                  onClick={() => deleteAddress.mutate(addr._id!)}
                  className="p-2 rounded-xl hover:bg-danger/10 text-[var(--muted)] hover:text-danger transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
