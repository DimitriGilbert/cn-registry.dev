import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CopyInstallCommandProps {
  command: string
  label?: string
}

export function CopyInstallCommand({ command, label = "Install Command" }: CopyInstallCommandProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="install-command">{label}</Label>
      <div className="flex gap-2">
        <Input id="install-command" value={command} readOnly className="font-mono text-sm" />
        <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0 bg-transparent">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
