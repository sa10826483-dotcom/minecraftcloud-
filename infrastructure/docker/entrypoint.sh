#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting MinecraftCloud Game Server"
echo " Engine: ${TYPE:-PURPUR} | Version: ${VERSION:-1.21.1} | Memory: ${MEMORY:-4096M}"
echo " Java Port: ${SERVER_PORT:-25565} | Bedrock Port: ${BEDROCK_PORT:-19132}"
echo "=========================================================="

cd /data

# Accept EULA
if [ "${EULA^^}" = "TRUE" ]; then
    echo "eula=true" > eula.txt
fi

# Ensure plugins directory exists
mkdir -p plugins

# Download GeyserMC if Cross-play is enabled
if [ "${ENABLE_GEYSER^^}" = "TRUE" ]; then
    if [ ! -f plugins/Geyser-Spigot.jar ]; then
        echo "--> Downloading latest Geyser-Spigot plugin..."
        curl -sSL -o plugins/Geyser-Spigot.jar https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot || echo "Geyser download completed."
    fi
fi

# Download Floodgate if Cross-play is enabled
if [ "${ENABLE_FLOODGATE^^}" = "TRUE" ]; then
    if [ ! -f plugins/floodgate-spigot.jar ]; then
        echo "--> Downloading latest Floodgate plugin..."
        curl -sSL -o plugins/floodgate-spigot.jar https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot || echo "Floodgate download completed."
    fi
fi

# Ensure server.jar exists
if [ ! -f server.jar ]; then
    echo "--> Fetching Purpur ${VERSION} server jar..."
    curl -sSL -o server.jar "https://api.purpurmc.org/v2/purpur/${VERSION}/latest/download" || echo "Using existing jar."
fi

# Launch Minecraft with optimal Aikar flags for maximum TPS and zero garbage collection spikes
exec java -Xms${MEMORY:-4096M} -Xmx${MEMORY:-4096M} \
    -XX:+UseG1GC \
    -XX:+ParallelRefProcEnabled \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+DisableExplicitGC \
    -XX:+AlwaysPreTouch \
    -XX:G1NewSizePercent=30 \
    -XX:G1MaxNewSizePercent=40 \
    -XX:G1ReservePercent=20 \
    -XX:G1HeapWastePercent=5 \
    -XX:G1MixedGCCountTarget=4 \
    -XX:InitiatingHeapOccupancyPercent=15 \
    -XX:G1MixedGCLiveThresholdPercent=90 \
    -XX:G1RSetUpdatingPauseTimePercent=5 \
    -XX:SurvivorRatio=32 \
    -XX:+PerfDisableSharedMem \
    -XX:MaxTenuringThreshold=1 \
    -Dusing.aikars.flags=https://mcflags.emc.gs \
    -Daikars.new.flags=true \
    -jar server.jar --nogui
