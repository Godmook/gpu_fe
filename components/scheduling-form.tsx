"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Cpu,
  HardDrive,
  MemoryStickIcon as Memory,
  Rocket,
  Clock,
  Zap,
  Server,
  Timer,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface ResourceConfig {
  gpu: number
  cpu: number
  memory: number
}

interface QueueItem {
  id: string
  team: string
  user: string
  gpuCount: number
  waitTime: number // minutes
  priority: "normal" | "urgent"
}

interface GPUUnit {
  id: string
  usage: number // percentage
  user?: string
  team?: string
  jobType?: string
  duration?: number // minutes
  allocations?: Array<{
    user: string
    team: string
    percentage: number
    jobType: string
    duration: number
  }>
}

interface NodeInfo {
  id: string
  name: string
  gpuType: string
  totalGPUs: number
  cpuCores: number
  memoryGB: number
  cpuAllocation: number // percentage
  gpuAllocation: number // percentage
  gpus: GPUUnit[]
  status: "online" | "maintenance" | "offline"
  queue: QueueItem[]
}

// mockNodes 데이터 추가 (dashboard.tsx와 동일한 데이터)
const mockNodes: NodeInfo[] = [
  // A100 Nodes
  {
    id: "node-a100-1",
    name: "Node-A100-01",
    gpuType: "A100",
    totalGPUs: 8,
    cpuCores: 128,
    memoryGB: 512,
    cpuAllocation: 45,
    gpuAllocation: 0,
    status: "maintenance",
    gpus: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: `gpu-a100-1-${i}`,
        usage: 0,
      })),
    queue: Array.from({ length: 25 }, (_, i) => ({
      id: `q-a100-${i}`,
      team: ["AI Research", "Data Science", "ML Platform", "Computer Vision", "NLP Team"][i % 5],
      user: ["김철수", "이영희", "박민수", "정수진", "최동현"][i % 5],
      gpuCount: [1, 2, 4, 8][i % 4],
      waitTime: Math.floor(Math.random() * 300) + 15,
      priority: i < 3 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-a100-2",
    name: "Node-A100-02",
    gpuType: "A100",
    totalGPUs: 8,
    cpuCores: 128,
    memoryGB: 512,
    cpuAllocation: 67,
    gpuAllocation: 12.5,
    status: "online",
    gpus: [
      {
        id: "gpu-a100-2-0",
        usage: 85,
        user: "김소영",
        team: "Data Science",
        jobType: "Training",
        duration: 120,
        allocations: [{ user: "김소영", team: "Data Science", percentage: 85, jobType: "Training", duration: 120 }],
      },
      ...Array(7)
        .fill(null)
        .map((_, i) => ({
          id: `gpu-a100-2-${i + 1}`,
          usage: 0,
        })),
    ],
    queue: Array.from({ length: 8 }, (_, i) => ({
      id: `q-a100-2-${i}`,
      team: ["AI Research", "Data Science", "ML Platform"][i % 3],
      user: ["김철수", "이영희", "박민수"][i % 3],
      gpuCount: [2, 4, 8][i % 3],
      waitTime: Math.floor(Math.random() * 200) + 30,
      priority: i < 2 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-a100-3",
    name: "Node-A100-03",
    gpuType: "A100",
    totalGPUs: 8,
    cpuCores: 128,
    memoryGB: 512,
    cpuAllocation: 89,
    gpuAllocation: 75,
    status: "online",
    gpus: [
      {
        id: "gpu-a100-3-0",
        usage: 95,
        user: "박지훈",
        team: "AI Research",
        jobType: "Training",
        duration: 180,
        allocations: [{ user: "박지훈", team: "AI Research", percentage: 95, jobType: "Training", duration: 180 }],
      },
      {
        id: "gpu-a100-3-1",
        usage: 87,
        user: "정수진",
        team: "Computer Vision",
        jobType: "Fine-tuning",
        duration: 240,
        allocations: [
          { user: "정수진", team: "Computer Vision", percentage: 87, jobType: "Fine-tuning", duration: 240 },
        ],
      },
      ...Array(6)
        .fill(null)
        .map((_, i) => ({
          id: `gpu-a100-3-${i + 2}`,
          usage: i < 4 ? Math.floor(Math.random() * 80) + 20 : 0,
        })),
    ],
    queue: Array.from({ length: 12 }, (_, i) => ({
      id: `q-a100-3-${i}`,
      team: ["AI Research", "Computer Vision", "NLP Team"][i % 3],
      user: ["박지훈", "정수진", "최동현"][i % 3],
      gpuCount: [1, 2, 4][i % 3],
      waitTime: Math.floor(Math.random() * 180) + 20,
      priority: i < 3 ? "urgent" : "normal",
    })),
  },
  // H100 Nodes
  {
    id: "node-h100-1",
    name: "Node-H100-01",
    gpuType: "H100",
    totalGPUs: 4,
    cpuCores: 64,
    memoryGB: 256,
    cpuAllocation: 78,
    gpuAllocation: 75,
    status: "online",
    gpus: [
      {
        id: "gpu-h100-1-0",
        usage: 85,
        user: "최동현",
        team: "NLP Team",
        jobType: "Training",
        duration: 120,
        allocations: [
          { user: "최동현", team: "NLP Team", percentage: 60, jobType: "Training", duration: 120 },
          { user: "박지훈", team: "AI Research", percentage: 25, jobType: "Testing", duration: 45 },
        ],
      },
      {
        id: "gpu-h100-1-1",
        usage: 92,
        user: "한지민",
        team: "Robotics",
        jobType: "Inference",
        duration: 85,
        allocations: [{ user: "한지민", team: "Robotics", percentage: 92, jobType: "Inference", duration: 85 }],
      },
      {
        id: "gpu-h100-1-2",
        usage: 67,
        user: "박지훈",
        team: "AI Research",
        jobType: "Fine-tuning",
        duration: 200,
        allocations: [
          { user: "박지훈", team: "AI Research", percentage: 40, jobType: "Fine-tuning", duration: 200 },
          { user: "김소영", team: "Data Science", percentage: 27, jobType: "Analysis", duration: 90 },
        ],
      },
      { id: "gpu-h100-1-3", usage: 0 },
    ],
    queue: Array.from({ length: 15 }, (_, i) => ({
      id: `q-h100-1-${i}`,
      team: ["Computer Vision", "AutoML", "Robotics", "NLP Team"][i % 4],
      user: ["정수진", "김나영", "한지민", "최동현"][i % 4],
      gpuCount: [1, 2, 4][i % 3],
      waitTime: Math.floor(Math.random() * 250) + 20,
      priority: i < 4 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-h100-2",
    name: "Node-H100-02",
    gpuType: "H100",
    totalGPUs: 4,
    cpuCores: 64,
    memoryGB: 256,
    cpuAllocation: 34,
    gpuAllocation: 25,
    status: "online",
    gpus: [
      {
        id: "gpu-h100-2-0",
        usage: 78,
        user: "송태호",
        team: "Edge AI",
        jobType: "Training",
        duration: 45,
        allocations: [{ user: "송태호", team: "Edge AI", percentage: 78, jobType: "Training", duration: 45 }],
      },
      { id: "gpu-h100-2-1", usage: 0 },
      { id: "gpu-h100-2-2", usage: 0 },
      { id: "gpu-h100-2-3", usage: 0 },
    ],
    queue: Array.from({ length: 6 }, (_, i) => ({
      id: `q-h100-2-${i}`,
      team: ["Data Science", "Edge AI", "AutoML"][i % 3],
      user: ["이영희", "송태호", "김나영"][i % 3],
      gpuCount: [1, 2, 3][i % 3],
      waitTime: Math.floor(Math.random() * 180) + 15,
      priority: i < 1 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-h100-3",
    name: "Node-H100-03",
    gpuType: "H100",
    totalGPUs: 4,
    cpuCores: 64,
    memoryGB: 256,
    cpuAllocation: 92,
    gpuAllocation: 100,
    status: "online",
    gpus: Array(4)
      .fill(null)
      .map((_, i) => ({
        id: `gpu-h100-3-${i}`,
        usage: Math.floor(Math.random() * 30) + 70,
        user: ["김철수", "이영희", "박민수", "정수진"][i],
        team: ["AI Research", "Data Science", "ML Platform", "Computer Vision"][i],
        jobType: "Training",
        duration: Math.floor(Math.random() * 200) + 60,
        allocations: [
          {
            user: ["김철수", "이영희", "박민수", "정수진"][i],
            team: ["AI Research", "Data Science", "ML Platform", "Computer Vision"][i],
            percentage: Math.floor(Math.random() * 30) + 70,
            jobType: "Training",
            duration: Math.floor(Math.random() * 200) + 60,
          },
        ],
      })),
    queue: Array.from({ length: 18 }, (_, i) => ({
      id: `q-h100-3-${i}`,
      team: ["AI Research", "Data Science", "ML Platform", "Computer Vision"][i % 4],
      user: ["김철수", "이영희", "박민수", "정수진"][i % 4],
      gpuCount: [1, 2, 4][i % 3],
      waitTime: Math.floor(Math.random() * 300) + 30,
      priority: i < 5 ? "urgent" : "normal",
    })),
  },
  // A30 Nodes
  {
    id: "node-a30-1",
    name: "Node-A30-01",
    gpuType: "A30",
    totalGPUs: 6,
    cpuCores: 48,
    memoryGB: 192,
    cpuAllocation: 56,
    gpuAllocation: 50,
    status: "online",
    gpus: [
      {
        id: "gpu-a30-1-0",
        usage: 45,
        user: "김소영",
        team: "Data Science",
        jobType: "Analysis",
        duration: 180,
        allocations: [{ user: "김소영", team: "Data Science", percentage: 45, jobType: "Analysis", duration: 180 }],
      },
      {
        id: "gpu-a30-1-1",
        usage: 67,
        user: "이준호",
        team: "Computer Vision",
        jobType: "Training",
        duration: 90,
        allocations: [
          { user: "이준호", team: "Computer Vision", percentage: 40, jobType: "Training", duration: 90 },
          { user: "정수진", team: "Computer Vision", percentage: 27, jobType: "Testing", duration: 30 },
        ],
      },
      {
        id: "gpu-a30-1-2",
        usage: 23,
        user: "박민수",
        team: "ML Platform",
        jobType: "Testing",
        duration: 60,
        allocations: [{ user: "박민수", team: "ML Platform", percentage: 23, jobType: "Testing", duration: 60 }],
      },
      { id: "gpu-a30-1-3", usage: 0 },
      { id: "gpu-a30-1-4", usage: 0 },
      {
        id: "gpu-a30-1-5",
        usage: 89,
        user: "정수진",
        team: "Computer Vision",
        jobType: "Training",
        duration: 120,
        allocations: [{ user: "정수진", team: "Computer Vision", percentage: 89, jobType: "Training", duration: 120 }],
      },
    ],
    queue: Array.from({ length: 12 }, (_, i) => ({
      id: `q-a30-1-${i}`,
      team: ["AutoML", "Edge AI", "Data Science", "ML Platform"][i % 4],
      user: ["김나영", "송태호", "이영희", "박민수"][i % 4],
      gpuCount: [1, 2][i % 2],
      waitTime: Math.floor(Math.random() * 150) + 10,
      priority: i < 2 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-a30-2",
    name: "Node-A30-02",
    gpuType: "A30",
    totalGPUs: 6,
    cpuCores: 48,
    memoryGB: 192,
    cpuAllocation: 73,
    gpuAllocation: 83.33,
    status: "online",
    gpus: Array(6)
      .fill(null)
      .map((_, i) => ({
        id: `gpu-a30-2-${i}`,
        usage: i < 5 ? Math.floor(Math.random() * 40) + 50 : 0,
        user: i < 5 ? ["김나영", "송태호", "이영희", "박민수", "최동현"][i] : undefined,
        team: i < 5 ? ["AutoML", "Edge AI", "Data Science", "ML Platform", "NLP Team"][i] : undefined,
        jobType: i < 5 ? "Training" : undefined,
        duration: i < 5 ? Math.floor(Math.random() * 150) + 60 : undefined,
        allocations:
          i < 5
            ? [
                {
                  user: ["김나영", "송태호", "이영희", "박민수", "최동현"][i],
                  team: ["AutoML", "Edge AI", "Data Science", "ML Platform", "NLP Team"][i],
                  percentage: Math.floor(Math.random() * 40) + 50,
                  jobType: "Training",
                  duration: Math.floor(Math.random() * 150) + 60,
                },
              ]
            : undefined,
      })),
    queue: Array.from({ length: 9 }, (_, i) => ({
      id: `q-a30-2-${i}`,
      team: ["AutoML", "Edge AI", "Computer Vision"][i % 3],
      user: ["김나영", "송태호", "정수진"][i % 3],
      gpuCount: [1, 2, 3][i % 3],
      waitTime: Math.floor(Math.random() * 120) + 15,
      priority: i < 2 ? "urgent" : "normal",
    })),
  },
  // H200 Nodes
  {
    id: "node-h200-1",
    name: "Node-H200-01",
    gpuType: "H200",
    totalGPUs: 2,
    cpuCores: 32,
    memoryGB: 128,
    cpuAllocation: 89,
    gpuAllocation: 100,
    status: "online",
    gpus: [
      {
        id: "gpu-h200-1-0",
        usage: 95,
        user: "김철수",
        team: "AI Research",
        jobType: "Large Model Training",
        duration: 300,
        allocations: [
          { user: "김철수", team: "AI Research", percentage: 95, jobType: "Large Model Training", duration: 300 },
        ],
      },
      {
        id: "gpu-h200-1-1",
        usage: 87,
        user: "최동현",
        team: "NLP Team",
        jobType: "LLM Fine-tuning",
        duration: 240,
        allocations: [{ user: "최동현", team: "NLP Team", percentage: 87, jobType: "LLM Fine-tuning", duration: 240 }],
      },
    ],
    queue: Array.from({ length: 20 }, (_, i) => ({
      id: `q-h200-1-${i}`,
      team: ["AI Research", "NLP Team", "Computer Vision"][i % 3],
      user: ["김철수", "최동현", "정수진"][i % 3],
      gpuCount: [1, 2][i % 2],
      waitTime: Math.floor(Math.random() * 400) + 60,
      priority: i < 5 ? "urgent" : "normal",
    })),
  },
  {
    id: "node-h200-2",
    name: "Node-H200-02",
    gpuType: "H200",
    totalGPUs: 2,
    cpuCores: 32,
    memoryGB: 128,
    cpuAllocation: 45,
    gpuAllocation: 50,
    status: "online",
    gpus: [
      {
        id: "gpu-h200-2-0",
        usage: 78,
        user: "박지훈",
        team: "AI Research",
        jobType: "Model Optimization",
        duration: 180,
        allocations: [
          { user: "박지훈", team: "AI Research", percentage: 78, jobType: "Model Optimization", duration: 180 },
        ],
      },
      { id: "gpu-h200-2-1", usage: 0 },
    ],
    queue: Array.from({ length: 14 }, (_, i) => ({
      id: `q-h200-2-${i}`,
      team: ["AI Research", "NLP Team", "Data Science"][i % 3],
      user: ["박지훈", "최동현", "김소영"][i % 3],
      gpuCount: [1, 2][i % 2],
      waitTime: Math.floor(Math.random() * 350) + 45,
      priority: i < 3 ? "urgent" : "normal",
    })),
  },
]

const GPU_TYPES = ["A100", "H100", "A30", "H200"]
const RESOURCE_CONFIGS: ResourceConfig[] = [
  { gpu: 1, cpu: 25, memory: 25 },
  { gpu: 1, cpu: 50, memory: 50 },
  { gpu: 1, cpu: 100, memory: 100 },
  { gpu: 2, cpu: 50, memory: 50 },
  { gpu: 2, cpu: 100, memory: 100 },
  { gpu: 4, cpu: 100, memory: 100 },
  { gpu: 8, cpu: 100, memory: 100 },
]

const AWS_IMAGES = [
  "Deep Learning AMI (Ubuntu 20.04)",
  "Deep Learning AMI (Amazon Linux 2)",
  "PyTorch 1.13 Training",
  "TensorFlow 2.11 Training",
  "Custom ML Environment v2.1",
]

function formatGPUCount(count: number): string {
  const normalized = count / 8
  return `${normalized} GPU`
}

function calculateAverageWaitTime(queue: QueueItem[]): number {
  if (queue.length === 0) return 0
  const totalWaitTime = queue.reduce((sum, item) => sum + item.waitTime, 0)
  return Math.round(totalWaitTime / queue.length)
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}시간 ${mins}분`
  }
  return `${mins}분`
}

function getStatusColor(status: string): string {
  switch (status) {
    case "online":
      return "text-green-600 bg-green-100"
    case "maintenance":
      return "text-yellow-600 bg-yellow-100"
    case "offline":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export default function SchedulingForm() {
  const [selectedGPU, setSelectedGPU] = useState("")
  const [selectedConfig, setSelectedConfig] = useState<ResourceConfig | null>(null)
  const [nodeCount, setNodeCount] = useState(1)
  const [awsImage, setAwsImage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [urgentReason, setUrgentReason] = useState("")
  const [maxNodes, setMaxNodes] = useState(8)
  const [showError, setShowError] = useState(false)
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null)
  const [availableNodes, setAvailableNodes] = useState<NodeInfo[]>([])

  useEffect(() => {
    if (selectedConfig) {
      const maxPossibleNodes = Math.floor(8 / selectedConfig.gpu)
      setMaxNodes(maxPossibleNodes)
      if (nodeCount > maxPossibleNodes) {
        setNodeCount(maxPossibleNodes)
      }
    }
  }, [selectedConfig, nodeCount])

  useEffect(() => {
    if (selectedGPU) {
      const nodes = mockNodes.filter((node) => node.gpuType === selectedGPU && node.status !== "maintenance")
      setAvailableNodes(nodes)
      setSelectedNode(null) // 새로운 GPU 타입 선택 시 노드 선택 초기화
    } else {
      setAvailableNodes([])
      setSelectedNode(null)
    }
  }, [selectedGPU])

  const handleConfigSelect = (config: ResourceConfig) => {
    setSelectedConfig(config)
    setShowError(false)
  }

  const handleNodeCountChange = (count: number) => {
    if (selectedConfig && selectedConfig.gpu * count > 8) {
      setShowError(true)
      return
    }
    setShowError(false)
    setNodeCount(count)
  }

  const handleSubmit = () => {
    if (!selectedGPU || !selectedConfig || !awsImage) {
      alert("모든 필수 항목을 선택해주세요.")
      return
    }

    if (priority === "urgent" && !urgentReason.trim()) {
      alert("긴급 작업의 경우 사유를 입력해주세요.")
      return
    }

    const jobData = {
      gpuType: selectedGPU,
      resourceConfig: selectedConfig,
      nodeCount,
      awsImage,
      priority,
      urgentReason: priority === "urgent" ? urgentReason : "",
      totalGPUs: selectedConfig.gpu * nodeCount,
    }

    console.log("Job submitted:", jobData)
    alert("작업이 성공적으로 제출되었습니다!")
  }

  return (
    <motion.div
      className="grid gap-4 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-violet-700 dark:text-violet-300 flex items-center gap-2 text-base">
              <Rocket className="w-4 h-4" />
              GPU 리소스 설정
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
              학습에 사용할 GPU 타입과 리소스를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* GPU Type Selection */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">GPU 타입</Label>
              <Select value={selectedGPU} onValueChange={setSelectedGPU}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 h-9">
                  <SelectValue placeholder="GPU 타입을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {GPU_TYPES.map((gpu) => (
                    <SelectItem key={gpu} value={gpu}>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3" />
                        {gpu}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Node Selection */}
            {selectedGPU && availableNodes.length > 0 && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5 }}
              >
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">노드 선택</Label>
                <Select
                  value={selectedNode?.id || ""}
                  onValueChange={(nodeId) => {
                    const node = availableNodes.find((n) => n.id === nodeId)
                    setSelectedNode(node || null)
                  }}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 h-9">
                    <SelectValue placeholder="노드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Server className="w-3 h-3" />
                            <span>{node.name}</span>
                            <Badge className={getStatusColor(node.status)} variant="outline">
                              {node.status}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Node Information */}
            {selectedNode && (
              <motion.div
                className="space-y-3 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-lg border border-violet-200 dark:border-violet-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="font-medium text-violet-700 dark:text-violet-300">{selectedNode.name} 현황</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* GPU 사용률 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">GPU 사용률</span>
                    </div>
                    <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                      {selectedNode.gpuAllocation.toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedNode.gpuAllocation}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedNode.gpus.filter((gpu) => gpu.usage > 0).length}/{selectedNode.totalGPUs} GPU 사용 중
                    </div>
                  </div>

                  {/* 대기 큐 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-fuchsia-600 dark:text-fuchsia-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">대기 큐</span>
                    </div>
                    <div className="text-lg font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      {selectedNode.queue.length}개 작업
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      평균 대기시간: {formatDuration(calculateAverageWaitTime(selectedNode.queue))}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      긴급 작업: {selectedNode.queue.filter((q) => q.priority === "urgent").length}개
                    </div>
                  </div>

                  {/* 리소스 정보 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">리소스</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>
                        CPU: {selectedNode.cpuCores}개 ({selectedNode.cpuAllocation}% 사용)
                      </div>
                      <div>Memory: {selectedNode.memoryGB}GB</div>
                      <div>
                        GPU: {selectedNode.totalGPUs}개 ({selectedNode.gpuType})
                      </div>
                    </div>
                  </div>
                </div>

                {/* 예상 대기시간 */}
                {selectedConfig && (
                  <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-violet-100 dark:border-violet-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">예상 대기시간</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      현재 설정으로 제출 시 약{" "}
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {formatDuration(
                          calculateAverageWaitTime(selectedNode.queue) + Math.floor(Math.random() * 30) + 10,
                        )}
                      </span>{" "}
                      대기 예상
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Resource Configuration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">리소스 구성</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {RESOURCE_CONFIGS.map((config, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConfig === config
                          ? "ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      } bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700`}
                      onClick={() => handleConfigSelect(config)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {formatGPUCount(config.gpu)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-fuchsia-600 dark:text-fuchsia-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{config.cpu}% CPU</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Memory className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{config.memory}% Memory</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Node Count */}
            {selectedConfig && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Node 수</Label>
                  <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{nodeCount}개</span>
                </div>

                {/* Custom Slider with smooth transitions */}
                <div className="relative">
                  <Slider
                    value={[nodeCount]}
                    onValueChange={(value) => handleNodeCountChange(value[0])}
                    max={maxNodes}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Visual Node Representation */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: maxNodes }, (_, i) => (
                      <motion.div
                        key={i}
                        className={`h-4 flex-1 rounded transition-all duration-300 ease-in-out ${
                          i < nodeCount
                            ? "bg-gradient-to-r from-violet-500 to-violet-600 shadow-sm"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>1개</span>
                    <span>최대 {maxNodes}개</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  총 GPU 사용량: {formatGPUCount(selectedConfig.gpu)} × {nodeCount} ={" "}
                  <span className="font-medium text-violet-600 dark:text-violet-400">
                    {formatGPUCount(selectedConfig.gpu * nodeCount)}
                  </span>
                </div>
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-700 dark:text-red-300 text-xs">
                        GPU 개수 × Node 수는 8을 넘을 수 없습니다.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-fuchsia-200 dark:border-fuchsia-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-fuchsia-700 dark:text-fuchsia-300 flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" />
              환경 설정
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
              AWS 이미지와 작업 우선순위를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AWS Image Selection */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">AWS Instance Image</Label>
              <Select value={awsImage} onValueChange={setAwsImage}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 h-9">
                  <SelectValue placeholder="AWS 이미지를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {AWS_IMAGES.map((image) => (
                    <SelectItem key={image} value={image}>
                      {image}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">작업 우선순위</Label>
              <RadioGroup value={priority} onValueChange={setPriority}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      Normal
                    </Badge>
                    일반 작업
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <Badge className="bg-red-500 hover:bg-red-600 text-xs">Urgent</Badge>
                    긴급 작업
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Urgent Reason */}
            {priority === "urgent" && (
              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">긴급 사유</Label>
                <Textarea
                  placeholder="긴급 작업의 사유를 입력하세요..."
                  value={urgentReason}
                  onChange={(e) => setUrgentReason(e.target.value)}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 min-h-[60px]"
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <Rocket className="w-4 h-4 mr-2" />
          작업 제출
        </Button>
      </motion.div>
    </motion.div>
  )
}
