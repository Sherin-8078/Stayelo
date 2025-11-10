import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './utils'
import { Slot } from '@radix-ui/react-slot'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
    {
        variants: {
            variant: {
                default: 'bg-cyan-500 hover:bg-sky-700 text-white font-semibold',
                destructive: 'bg-red-500 text-white hover:bg-red-600 font-semibold',
                outline: 'border border-slate-200 hover:bg-slate-100 font-semibold',
                subtle: 'bg-slate-100 text-slate-900 hover:bg-slate-200 font-semibold',
                delete_btn: 'bg-red-100 text-red-500 hover:bg-red-200 font-bold ',
            },
            size: {
                default: 'py-2 px-4',
                sm: 'py-1 px-3 text-xs',
                lg: 'py-3 px-5 text-lg',
            },
        },
        defaultVariants: {
            intent: 'default',
            size: 'default',
        },
    }
)
const Button = ({className,variant,size,asChild = false, ...props}) => {
    const Comp = asChild ? Slot : 'button'
  return (
    <Comp 
        className={cn(buttonVariants({variant,size,className}))} 
        {...props} />
  )
}

export {Button,buttonVariants}
