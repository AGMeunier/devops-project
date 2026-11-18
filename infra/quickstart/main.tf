terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  # Sur Windows 11, le provider détecte automatiquement Docker Desktop.
  # En cas d'erreur de connexion au daemon, décommentez la ligne suivante :
  # host = "npipe:////./pipe/docker_engine"
}

resource "docker_image" "nginx" {
  name = "nginx:1.27"
}

resource "docker_container" "web" {
  name  = "tf-web"
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = 8082
  }
}
