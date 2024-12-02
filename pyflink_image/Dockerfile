# Inspired from apache's own documentation https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/python/python_config/
FROM flink:1.20.0-java11

RUN rm -rf $JAVA_HOME

# Copied from https://github.com/adoptium/containers/blob/f6d4923380ecb1ec4b0d58c633ebb0aeed4c8332/11/jdk/ubuntu/jammy/Dockerfile
# Which is an official Docker image https://hub.docker.com/layers/library/eclipse-temurin/11-jdk-jammy/images/sha256-0b1c4c2bd4bc536c3ee914cd9e7c3ac05e136f891bceb18d355f60d548e84096?context=explore
# And inspired by https://www.decodable.co/blog/getting-started-with-pyflink-on-kubernetes
# regarding the issues of installing pemja as it requires full jdk installation
RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
       aarch64|arm64) \
         ESUM='8c3146035b99c55ab26a2982f4b9abd2bf600582361cf9c732539f713d271faf'; \
         BINARY_URL='https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_aarch64_linux_hotspot_11.0.21_9.tar.gz'; \
         ;; \
       amd64|i386:x86-64) \
         ESUM='60ea98daa09834fdd3162ca91ddc8d92a155ab3121204f6f643176ee0c2d0d5e'; \
         BINARY_URL='https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_x64_linux_hotspot_11.0.21_9.tar.gz'; \
         ;; \
       armhf|arm) \
         ESUM='a64b005b84b173e294078fec34660ed3429d8c60726a5fb5c140e13b9e0c79fa'; \
         BINARY_URL='https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_arm_linux_hotspot_11.0.21_9.tar.gz'; \
         ;; \
       ppc64el|powerpc:common64) \
         ESUM='262ff98d6d88a7c7cc522cb4ec4129491a0eb04f5b17dcca0da57cfcdcf3830d'; \
         BINARY_URL='https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_ppc64le_linux_hotspot_11.0.21_9.tar.gz'; \
         ;; \
       s390x|s390:64-bit) \
         ESUM='bc67f79fb82c4131d9dcea32649c540a16aa380a9726306b9a67c5ec9690c492'; \
         BINARY_URL='https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_s390x_linux_hotspot_11.0.21_9.tar.gz'; \
         ;; \
       *) \
         echo "Unsupported arch: ${ARCH}"; \
         exit 1; \
         ;; \
    esac; \
    wget --progress=dot:giga -O /tmp/openjdk.tar.gz ${BINARY_URL}; \
    echo "${ESUM} */tmp/openjdk.tar.gz" | sha256sum -c -; \
    mkdir -p "$JAVA_HOME"; \
    tar --extract \
        --file /tmp/openjdk.tar.gz \
        --directory "$JAVA_HOME" \
        --strip-components 1 \
        --no-same-owner \
    ; \
    rm -f /tmp/openjdk.tar.gz ${JAVA_HOME}/lib/src.zip; \
    # https://github.com/docker-library/openjdk/issues/331#issuecomment-498834472
    find "$JAVA_HOME/lib" -name '*.so' -exec dirname '{}' ';' | sort -u > /etc/ld.so.conf.d/docker-openjdk.conf; \
    ldconfig; \
    # https://github.com/docker-library/openjdk/issues/212#issuecomment-420979840
    # https://openjdk.java.net/jeps/341
    java -Xshare:dump;

# install python3 and pip3
RUN apt-get update -y && \
apt-get install -y python3 python3-pip python3-dev openjdk-11-jdk-headless && rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python

# install PyFlink
RUN pip3 install apache-flink==1.20.0

# install google-cloud-bigquery-storage (to disable a warning)
RUN pip3 install google-cloud-bigquery-storage

# install kafka connector
RUN wget -P /opt/flink/lib https://repo.maven.apache.org/maven2/org/apache/flink/flink-sql-connector-kafka/3.3.0-1.20/flink-sql-connector-kafka-3.3.0-1.20.jar
RUN wget -P /opt/flink/lib https://repo.maven.apache.org/maven2/org/apache/flink/flink-sql-avro/1.20.0/flink-sql-avro-1.20.0.jar
