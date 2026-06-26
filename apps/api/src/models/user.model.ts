import mongoose, { Schema, type Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface IAddress {
  _id?: mongoose.Types.ObjectId
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  addresses: IAddress[]
  refreshTokenHash?: string
  isBanned: boolean
  resetTokenHash?: string
  resetTokenExp?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(plain: string): Promise<boolean>
  toSafeJSON(): Record<string, unknown>
}

const AddressSchema = new Schema<IAddress>(
  {
    label: String,
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
)

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatarUrl: String,
    addresses: [AddressSchema],
    refreshTokenHash: { type: String, select: false },
    isBanned: { type: Boolean, default: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExp: { type: Date, select: false },
  },
  { timestamps: true }
)

UserSchema.index({ role: 1 })

UserSchema.methods['comparePassword'] = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash as string)
}

UserSchema.methods['toSafeJSON'] = function (): Record<string, unknown> {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.refreshTokenHash
  delete obj.resetTokenHash
  delete obj.resetTokenExp
  delete obj.__v
  return obj
}

export const User = mongoose.model<IUser>('User', UserSchema)

// Helper: hash a refresh token for storage
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
