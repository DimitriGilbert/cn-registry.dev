import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, Clock, Mail } from "lucide-react"

export default function MaintenancePage() {
  return (
    <Container>
      <div className="py-16">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Under Maintenance</CardTitle>
              <CardDescription>
                We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expected downtime: 2-3 hours</span>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <Label htmlFor="email">Get notified when we're back</Label>
                  <div className="flex gap-2 mt-2">
                    <Input id="email" type="email" placeholder="Enter your email" className="flex-1" />
                    <Button>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">Follow us on social media for real-time updates</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  )
}
