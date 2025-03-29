"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Link, useNavigate } from "react-router-dom"
import { CalendarIcon } from "lucide-react"

export default function AddSubscription() {
  const [date, setDate] = React.useState<Date>()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add your form submission logic here
    navigate("/subscriptions") // Navigate to subscriptions page after submission
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add New Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Enter the details of your new subscription.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subscription Name</Label>
          <Input id="name" placeholder="Netflix, Spotify, etc." required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Monthly Amount</Label>
          <Input id="amount" type="number" placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label>Billing Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" asChild>
            <Link to="/subscriptions">Cancel</Link>
          </Button>
          <Button type="submit">Add Subscription</Button>
        </div>
      </form>
    </div>
  )
}

