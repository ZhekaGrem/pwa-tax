'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PropertySchema, type Property } from '@/schemas/appeal'
import { useAppealStore } from '@/store/useAppealStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepProperty() {
  const { property, patchProperty, nextStep } = useAppealStore()
  const form = useForm<Property>({
    resolver: zodResolver(PropertySchema),
    defaultValues: { county: 'Harris', ...property },
  })
  const onSubmit = (v: Property) => {
    patchProperty(v)
    nextStep()
  }

  const field = (name: keyof Property, label: string, type = 'text') => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...form.register(name, { valueAsNumber: type === 'number' })} />
      {form.formState.errors[name] && (
        <p className="text-sm text-red-600">{String(form.formState.errors[name]?.message)}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Step 1: Your property</h2>
      {field('address', 'Address')}
      {field('parcelId', 'Parcel ID')}
      {field('yearBuilt', 'Year built', 'number')}
      {field('sqft', 'Sqft', 'number')}
      {field('bedrooms', 'Bedrooms', 'number')}
      {field('bathrooms', 'Bathrooms', 'number')}
      {field('lotSizeSqft', 'Lot size', 'number')}
      <Button type="submit">Next</Button>
    </form>
  )
}
