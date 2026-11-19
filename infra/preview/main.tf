terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }

  backend "local" {}
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "pr_number" {
  type = string

  validation {
    condition     = can(regex("^[0-9]+$", var.pr_number))
    error_message = "pr_number must contain digits only."
  }
}

variable "image" {
  type = string
}

variable "owner" {
  type    = string
  default = "devops-lab"
}

variable "expires" {
  type        = string
  description = "Expiration timestamp for cost control"
  default     = "24h"
}

resource "kubernetes_namespace" "preview" {
  metadata {
    name = "pr-${var.pr_number}"
    labels = {
      purpose = "preview"
      pr      = var.pr_number
      owner   = var.owner
      expires = var.expires
    }
  }
}

resource "kubernetes_deployment" "app" {
  metadata {
    name      = "myapp"
    namespace = kubernetes_namespace.preview.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "myapp"
      }
    }

    template {
      metadata {
        labels = {
          app = "myapp"
        }
      }

      spec {
        container {
          name  = "myapp"
          image = var.image

          port {
            container_port = 3000
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "app" {
  metadata {
    name      = "myapp"
    namespace = kubernetes_namespace.preview.metadata[0].name
  }

  spec {
    selector = {
      app = "myapp"
    }

    port {
      port        = 80
      target_port = 3000
    }

    type = "ClusterIP"
  }
}

output "preview_url" {
  value = "http://${kubernetes_service.app.metadata[0].name}.${kubernetes_namespace.preview.metadata[0].name}.svc.cluster.local"
}
