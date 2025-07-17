import Link from "next/link"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"
import { Container } from "./container"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">cn</span>
                </div>
                <span className="font-semibold">registry</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover and share shadcn/ui components and developer tools.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/components" className="text-muted-foreground hover:text-foreground">
                    Components
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-muted-foreground hover:text-foreground">
                    Tools
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/github" className="text-muted-foreground hover:text-foreground">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="/discord" className="text-muted-foreground hover:text-foreground">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="/twitter" className="text-muted-foreground hover:text-foreground">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 cn-registry. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Link href="/github" className="text-muted-foreground hover:text-foreground">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="/twitter" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="/discord" className="text-muted-foreground hover:text-foreground">
                <Discord className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
