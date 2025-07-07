import React from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {CSS} from '@dnd-kit/utilities'
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export interface QueueItem {
  id: string
  team: string
  user: string
  gpuCount: number
  waitTime: number // minutes
  priority: "normal" | "urgent"
  cpu?: number
  memory?: number
  gpuPercent?: number // 0~100
  cpuPercent?: number // 0~100
  memoryPercent?: number // 0~100
}

interface Props {
  queue: QueueItem[]
  onChange: (newQueue: QueueItem[]) => void
  colored?: boolean
  sensors?: any
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}시간 ${mins}분`
  }
  return `${mins}분`
}

function QueueDndList({ queue, onChange, colored, sensors }: Props) {
  const defaultSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = queue.findIndex((item) => item.id === active.id)
      const newIndex = queue.findIndex((item) => item.id === over?.id)
      onChange(arrayMove(queue, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors || defaultSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={queue.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {queue.map((item, idx) => (
            <SortableQueueItem key={item.id} item={item} index={idx} colored={colored} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function getWaitTimeColor(waitTime: number) {
  if (waitTime < 30) return "bg-gradient-to-r from-green-300 to-green-400 text-green-900"
  if (waitTime < 60) return "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900"
  if (waitTime < 120) return "bg-gradient-to-r from-orange-200 to-orange-400 text-orange-900"
  return "bg-gradient-to-r from-red-300 to-red-500 text-red-900"
}

import { HardDrive, Cpu, MemoryStick } from "lucide-react"

function SortableQueueItem({ item, index, colored }: { item: QueueItem, index?: number, colored?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }
  if (colored) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm gap-4 cursor-grab select-none ${getWaitTimeColor(item.waitTime)}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs w-5 text-center">{(index ?? 0) + 1}</span>
          <Badge variant="outline" className="text-xs truncate max-w-[80px]">{item.team}</Badge>
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[70px]">{item.user}</span>
          <span className="ml-2 flex items-center gap-1 text-xs text-gray-500">
            <HardDrive className="w-3 h-3" />{item.gpuCount}
            {typeof item.gpuPercent === 'number' && (
              <span className="ml-1 text-[10px] text-violet-700 dark:text-violet-200">({item.gpuPercent}%)</span>
            )}
            <Cpu className="w-3 h-3 ml-2" />{item.cpu || 0}
            {typeof item.cpuPercent === 'number' && (
              <span className="ml-1 text-[10px] text-blue-700 dark:text-blue-200">({item.cpuPercent}%)</span>
            )}
            <MemoryStick className="w-3 h-3 ml-2" />{item.memory || 0}
            {typeof item.memoryPercent === 'number' && (
              <span className="ml-1 text-[10px] text-amber-700 dark:text-amber-200">({item.memoryPercent}%)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold whitespace-nowrap">{formatDuration(item.waitTime)}</span>
        </div>
      </div>
    )
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab select-none gap-4`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs truncate max-w-[100px]">{item.team}</Badge>
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]">{item.user}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDuration(item.waitTime)}</span>
      </div>
    </div>
  )
}

export default QueueDndList 