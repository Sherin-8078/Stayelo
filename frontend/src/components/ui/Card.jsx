import React from 'react'
import { cn } from './utils'

const Card = ({ className, ...props }) => {
  return (
    <div 
        data-slot = "Card"
        className={cn('rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col gap-4 float-left', className)}
         {...props}>
      
    </div>
  )
}
const CardHeader = ({ className, ...props }) => {
  return (
    <div
        data-slot = "CardHeader"
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}>

    </div>
  )
}
const CardTitle = ({ className, ...props }) => {
  return (
    <h3     
        data-slot = "CardTitle"
        className={cn('text-lg font-semibold leading-tight', className)}
        {...props}>

    </h3>
  )
}   
const CardDescription = ({ className, ...props }) => {
  return (
    <p 
        data-slot = "CardDescription"
        className={cn('text-sm text-slate-500', className)}
        {...props}>     


    </p>
  )
}
const CardContent = ({ className, ...props }) => {
    return (
        <div
            data-slot = "CardContent"
            className={cn('p-6 pt-0', className)}
            {...props}>
        </div>
    )
}
const CardAction = ({ className, ...props }) => {
    return (
        <div
            data-slot = "CardAction"
            className={cn('p-6 pt-0', className)}
            {...props}>
        </div>
    )
}
export {Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction}
