import React, { ReactNode } from 'react';

type WhenProps = {
  guard: boolean
  children: ReactNode | undefined
}

const When = (props: WhenProps) => {
  const {guard, children} = props

  
  if (guard) {
    return <>{children}</>
  } else {
    return null
  }
}

export { When }; 
