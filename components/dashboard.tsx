"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HardDrive,
  Server,
  Cpu,
  MemoryStick,
  Clock,
  User,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import QueueDndList, { QueueItem as DndQueueItem } from "@/components/queue-dnd-list"
import QueueManagementModal from "@/components/queue-management-modal"

// API에서 받아올 데이터 타입 정의
interface NodeSummary {
  node_name: string
  gpu_type: string
  cpu_usage_pct: number
  gpu_usage_pct: number
}

interface JobInfo {
  job_name: string
  usage: number
}

interface GPUDetail {
  gpu_index: number
  jobs: JobInfo[]
}

interface NodeDetail {
  node_name: string
  cpu_usage_pct: number
  gpus: GPUDetail[]
}

export default function Dashboard() {
  const [nodeList, setNodeList] = useState<NodeSummary[]>([])
  const [selectedGPUType, setSelectedGPUType] = useState<string>("")
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [nodeDetails, setNodeDetails] = useState<Record<string, NodeDetail | null>>({})
  const [selectedGPUIndex, setSelectedGPUIndex] = useState<number | null>(null)
  const [showJobs, setShowJobs] = useState<{ [key: string]: number | null }>({})

  // 노드 목록 fetch
  useEffect(() => {
    fetch("/api/v1/gpu-dashboard/nodes")
      .then(res => res.json())
      .then((data: NodeSummary[]) => {
        setNodeList(data)
        if (data.length > 0 && !selectedGPUType) {
          setSelectedGPUType(data[0].gpu_type)
        }
      })
  }, [])

  // 노드 클릭 시 상세 fetch
  const handleNodeClick = (nodeName: string) => {
    setExpandedNode(nodeName)
    setSelectedGPUIndex(null)
    setShowJobs({})
    if (!nodeDetails[nodeName]) {
      fetch(`/api/v1/gpu-dashboard/nodes/${nodeName}`)
        .then(res => res.json())
        .then((detail: NodeDetail) => {
          setNodeDetails(prev => ({ ...prev, [nodeName]: detail }))
        })
    }
  }

  // GPU 블록 클릭 시 jobs 토글
  const handleGPUClick = (nodeName: string, gpuIndex: number) => {
    setShowJobs(prev => ({ ...prev, [nodeName]: prev[nodeName] === gpuIndex ? null : gpuIndex }))
  }

  // GPU 타입 목록
  const gpuTypes = Array.from(new Set(nodeList.map(n => n.gpu_type))).sort()
  const filteredNodes = nodeList.filter(n => n.gpu_type === selectedGPUType)

  return (
    <div className="space-y-4">
      {/* GPU Type Filter */}
      <div className="flex gap-2 mb-4">
        {gpuTypes.map(gpuType => (
          <Button
            key={gpuType}
            variant={selectedGPUType === gpuType ? "default" : "outline"}
            onClick={() => setSelectedGPUType(gpuType)}
            className="flex items-center gap-2"
          >
            <HardDrive className="w-4 h-4" />
            {gpuType}
          </Button>
        ))}
      </div>
      {/* Node List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredNodes.map(node => (
          <Card key={node.node_name} className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-slate-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                {node.node_name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                GPU: {node.gpu_usage_pct.toFixed(1)}% / CPU: {node.cpu_usage_pct.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" onClick={() => handleNodeClick(node.node_name)}>
                {expandedNode === node.node_name ? "닫기" : "상세 보기"}
              </Button>
              {expandedNode === node.node_name && nodeDetails[node.node_name] && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm mb-2">GPU 사용 현황</div>
                  <div className="flex gap-2 flex-wrap">
                    {nodeDetails[node.node_name]?.gpus.map((gpu, idx) => {
                      const totalUsage = gpu.jobs.reduce((sum, job) => sum + job.usage, 0)
                      let color = "bg-green-300"
                      if (totalUsage >= 100) color = "bg-red-400"
                      else if (totalUsage >= 80) color = "bg-orange-400"
                      else if (totalUsage >= 50) color = "bg-yellow-300"
                      return (
                        <div key={gpu.gpu_index} className="flex flex-col items-center">
                          <div
                            className={`w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer ${color}`}
                            onClick={() => handleGPUClick(node.node_name, gpu.gpu_index)}
                          >
                            <span className="font-bold text-lg">{gpu.gpu_index}</span>
                          </div>
                          <div className="text-xs mt-1">{totalUsage}%</div>
                          {/* jobs info */}
                          {showJobs[node.node_name] === gpu.gpu_index && (
                            <div className="mt-2 bg-white dark:bg-gray-900 border rounded p-2 shadow text-xs w-40">
                              {gpu.jobs.length === 0 ? (
                                <div>작업 없음</div>
                              ) : (
                                gpu.jobs.map(job => (
                                  <div key={job.job_name} className="flex justify-between mb-1">
                                    <span>{job.job_name}</span>
                                    <span>{job.usage}%</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
