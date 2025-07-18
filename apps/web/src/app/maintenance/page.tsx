import { Clock, Mail, Wrench } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MaintenancePage() {
	return (
		<Container>
			<div className="py-16">
				<div className="mx-auto max-w-md text-center">
					<Card>
						<CardHeader>
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Wrench className="h-8 w-8 text-primary" />
							</div>
							<CardTitle>Under Maintenance</CardTitle>
							<CardDescription>
								We're currently performing scheduled maintenance to improve your
								experience. We'll be back shortly!
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
								<Clock className="h-4 w-4" />
								<span>Expected downtime: 2-3 hours</span>
							</div>

							<div className="space-y-4">
								<div className="text-left">
									<Label htmlFor="email">Get notified when we're back</Label>
									<div className="mt-2 flex gap-2">
										<Input
											id="email"
											type="email"
											placeholder="Enter your email"
											className="flex-1"
										/>
										<Button>
											<Mail className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>

							<div className="text-muted-foreground text-xs">
								Follow us on social media for real-time updates
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</Container>
	);
}
