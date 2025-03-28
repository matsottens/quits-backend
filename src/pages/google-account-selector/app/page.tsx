import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default function GoogleAccountSelector() {
  // Sample account data - in a real app, this would come from an API or auth provider
  const accounts = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Work Account",
      email: "jsmith@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-custom py-3 px-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-settings"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>

        <div className="flex items-center justify-center">
          <Image src="/images/quits-logo.png" alt="Quits Logo" width={90} height={90} />
        </div>

        <Button variant="ghost" size="icon" className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-custom-cream p-6 flex flex-col items-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-medium tracking-tight text-center mb-8 text-gray-800 font-sans">
            Choose your Google account
          </h1>

          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <Link href="#" className="flex items-center">
                  <div className="mr-4">
                    <Image
                      src={account.avatar || "/placeholder.svg"}
                      alt={account.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-gray-500 text-sm">{account.email}</p>
                  </div>
                </Link>
              </Card>
            ))}

            <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <Link href="#" className="flex items-center">
                <div className="mr-4">
                  <PlusCircle className="h-10 w-10 text-blue-custom" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-custom">Add another account</h3>
                </div>
              </Link>
            </Card>

            <div className="mt-6 text-center">
              <Button variant="outline" className="text-blue-custom">
                Use another account
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-8">
              To continue, Google will share your name, email address, and profile picture with Quits.
              <br />
              <Link href="#" className="text-blue-custom hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

