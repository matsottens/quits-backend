"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router-dom"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="notifications" className="flex flex-col space-y-1">
            <span>Enable notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive notifications when you receive a new message.
            </span>
          </Label>
          <Switch id="notifications" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="marketing_emails" />
          <label
            htmlFor="marketing_emails"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Marketing emails
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="security_emails" defaultChecked />
          <label
            htmlFor="security_emails"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Security emails
          </label>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive email notifications.
        </p>
        <div className="flex items-start space-x-4 pt-4">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="communication_emails" className="flex flex-col space-y-1">
                <span>Communication emails</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive emails about your account activity.
                </span>
              </Label>
              <Switch id="communication_emails" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="marketing_emails" className="flex flex-col space-y-1">
                <span>Marketing emails</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive emails about new products, features, and more.
                </span>
              </Label>
              <Switch id="marketing_emails" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="social_emails" className="flex flex-col space-y-1">
                <span>Social emails</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive emails for friend requests, follows, and more.
                </span>
              </Label>
              <Switch id="social_emails" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="security_emails" className="flex flex-col space-y-1">
                <span>Security emails</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive emails about your account activity and security.
                </span>
              </Label>
              <Switch id="security_emails" defaultChecked />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <span>Delete Account</span>
          <span className="font-normal leading-snug text-muted-foreground">
            Permanently delete your account and all of your content.
          </span>
        </div>
        <Button variant="destructive">Delete Account</Button>
      </div>
    </div>
  )
}

