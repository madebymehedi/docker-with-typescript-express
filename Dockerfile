# -------------------------------
# 🧱 Base image selection
# -------------------------------
# FROM node:lts
#   - Based on full Debian (large ~1GB)
#   - Easiest for compatibility (all tools available)
#   - Good for development or when building native modules
#
# FROM node:lts-slim
#   - Based on "Debian slim" (medium size ~250MB)
#   - Balanced between size and compatibility
#   - Best general-purpose choice
#
# FROM node:lts-alpine
#   - Based on Alpine Linux (very small ~80MB)
#   - Great for minimal production images
#   - ⚠️ Some native Node modules may fail to compile due to musl libc
#
# 👉 Choose one base image below depending on your needs:
FROM node:lts-alpine

# -------------------------------
# 📁 Set up working directory
# -------------------------------
# /app is a common convention inside containers
# Keeps all app files isolated and cleanly organized
# doesn’t collide with system folders like /usr, /bin, /etc
WORKDIR /app

# -------------------------------
# 🧩 Enable Corepack (manages pnpm automatically)
# -------------------------------
# Node >=16.9 comes with Corepack preinstalled.
# This will install pnpm based on your "packageManager" field in package.json.
RUN corepack enable

# -------------------------------
# 📦 Copy dependency files first
# -------------------------------
# Copy only package.json and pnpm-lock.yaml for better layer caching.
# If your source code changes but dependencies don’t, this layer stays cached
# and Docker won’t reinstall dependencies again.
COPY package.json pnpm-lock.yaml ./

# -------------------------------
# 📥 Install dependencies
# -------------------------------
# Use --frozen-lockfile to ensure dependencies match your lockfile exactly.
RUN pnpm install --frozen-lockfile

# -------------------------------
# 📂 Copy rest of your source code
# -------------------------------
# Now bring in the rest of your project (source, configs, etc.)
COPY . .

# -------------------------------
# 🌐 Expose application port
# -------------------------------
# EXPOSE tells Docker (and other developers) which port
# your application listens on inside the container.
#
# ⚠️ It does NOT actually publish or open the port automatically.
# You still need to map it manually when running the container:
# Example:
#   docker run -p <HOST_PORT>:<CONTAINER_PORT> myapp
#   docker run -p 3000:5000 myapp
#   Maps port 3000 on host to port 5000 in container
#   so you can access the app at http://localhost:3000
#
# The syntax is:
#   EXPOSE <container_port>
# Here we expose port 5000 to match our app's default.
EXPOSE 5000

# -------------------------------
# 🌱 Set environment variables
# -------------------------------
# NODE_ENV determines the mode your app runs in
# Common values: "development" | "production"
# if you forget to set it during docker build, you can set it at runtime:
# Example:
#   docker run -e NODE_ENV=production myapp
ENV NODE_ENV=development
# Set PORT environment variable for your app
# ENV PORT=5000
# Set HOST environment variable for your app
# ENV HOST=0.0.0.0

# -------------------------------
# 🚀 Define startup command
# -------------------------------
# The CMD instruction tells Docker what command to run
# when the container starts.
#
# Here we use "pnpm start" which runs the app in production mode.
# It launches the built app (e.g., from "dist/") without file watching.
#
# 🧑‍💻 Use "pnpm dev" instead when developing locally.
# - Runs with hot reload / file watcher
# - Useful only in development containers
#
# 🚀 Use "pnpm start" in production containers.
# - Runs a single process, no file watching
# - Lightweight and stable for deployment
CMD ["pnpm", "dev"]
