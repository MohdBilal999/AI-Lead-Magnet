"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Lead } from "@prisma/client"
import { useState } from "react"
import dayjs from "dayjs"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import EmailModal from "./EmailModal"

function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([])
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailTarget, setEmailTarget] = useState<Lead | Lead[]>([])

  const handleSelectLead = (lead: Lead, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, lead])
    } else {
      setSelectedLeads(selectedLeads.filter((l) => l.id !== lead.id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads([...leads])
    } else {
      setSelectedLeads([])
    }
  }

  const openEmailModal = (target: Lead | Lead[]) => {
    setEmailTarget(target)
    setIsEmailModalOpen(true)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        {selectedLeads.length > 0 && (
          <Button onClick={() => openEmailModal(selectedLeads)} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Selected ({selectedLeads.length})
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={leads.length > 0 && selectedLeads.length === leads.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="text-lg">Name</TableHead>
            <TableHead className="text-lg">Email</TableHead>
            <TableHead className="text-lg">Signup Date</TableHead>
            <TableHead className="text-lg">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox
                  checked={selectedLeads.some((l) => l.id === lead.id)}
                  onCheckedChange={(checked: boolean) => handleSelectLead(lead, checked as boolean)}
                />
              </TableCell>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{dayjs(lead.createdAt).format("MM-DD-YYYY")}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEmailModal(lead)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {leads.length === 0 && <div className="text-center m-5 font-bold">No Leads Found</div>}

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} recipients={emailTarget} />
    </>
  )
}

export default LeadsTable

