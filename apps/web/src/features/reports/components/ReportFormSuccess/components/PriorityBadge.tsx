"use client"

import { Badge, type BadgeType } from "@/components/ui/Badge"

export type PriorityLevel = "Baixa" | "Média" | "Alta"

const priorityToTypeMapper: Record<PriorityLevel, BadgeType> = {
  Alta: "danger",
  Média: "warn",
  Baixa: "success",
}

export type PriorityBadgeProps = {
  priority: PriorityLevel
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge type={priorityToTypeMapper[priority]} className={className}>
      Prioridade {priority}
    </Badge>
  )
}
