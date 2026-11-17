'use client'

import { TextField, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const ColorField: TextFieldClientComponent = (props) => {
  const { value, setValue, disabled } = useField<string>({ potentiallyStalePath: props.path })

  return (
    <div className="sp-color-field">
      <TextField {...props} />
      <input type="color" aria-label="Wybierz kolor z palety" disabled={disabled || props.readOnly}
        value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#e06a38'}
        onChange={(event) => setValue(event.target.value.toUpperCase())} />
    </div>
  )
}
