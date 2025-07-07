"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import QueueDndList, { QueueItem as DndQueueItem } from "@/components/queue-dnd-list"
import { Badge } from "@/components/ui/badge"
import { Clock, Cpu, HardDrive, MemoryStick } from "lucide-react"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"

interface Props {
  open: boolean
  onClose: () => void
  queue: DndQueueItem[]
  onSave: (newQueue: DndQueueItem[]) => void
}

function getWaitTimeColor(waitTime: number) {
  // 예쁜 그라데이션: 초록→노랑→주황→빨강
  if (waitTime < 30) return "bg-gradient-to-r from-green-300 to-green-400 text-green-900"
  if (waitTime < 60) return "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900"
  if (waitTime < 120) return "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900"
  return "bg-gradient-to-r from-red-300 to-red-500 text-red-900"
}

export default function QueueManagementModal({ open, onClose, queue, onSave }: Props) {
  const [draft, setDraft] = useState<DndQueueItem[]>(queue)

  React.useEffect(() => {
    setDraft(queue)
  }, [queue, open])

  // Use dnd-kit sensors (same as QueueDndList)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>대기 큐 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-xs text-gray-500 mb-2">드래그로 우선순위를 변경할 수 있습니다.</div>
          <QueueDndList queue={draft} onChange={setDraft} colored sensors={sensors} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={() => { onSave(draft); onClose() }}>변경사항 적용</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}시간 ${mins}분`
  }
  return `${mins}분`
}
