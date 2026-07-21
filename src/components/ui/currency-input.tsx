import * as React from "react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

function formatDigits(digits: string) {
  if (!digits) return ""
  return new Intl.NumberFormat("pt-BR").format(Number(digits))
}

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onValueChange: (value: number) => void
}

function CurrencyInput({ value, onValueChange, className, id, ...props }: CurrencyInputProps) {
  const [display, setDisplay] = React.useState(() => formatDigits(String(value || "")))

  React.useEffect(() => {
    setDisplay(formatDigits(String(value || "")))
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    setDisplay(formatDigits(digits))
    onValueChange(digits ? Number(digits) : 0)
  }

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <InputGroupText>R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        {...props}
      />
    </InputGroup>
  )
}

export { CurrencyInput }
