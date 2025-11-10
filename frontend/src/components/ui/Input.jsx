import React from 'react'
import { cn } from './utils'
const Input = ({ className ,type , ...props}) => {
  return (
    <div>
      <input
        type={type}
        className={cn(
          " focus:outline-2 focus:outline-offset focus:outline-blue-500 active:border-blue-500 rounded-full p-2 bg-blue-100 placeholder:text-slate-950 px-8 ",
          className
        )}
        {...props}
      />
    </div>
  )
}

export default Input
