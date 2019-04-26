#! /bin/bash -e

export PREFIXTAG="notes-"
export BUILDTAG=${BUILDTAG:=dev}

if [ -z "$SERVICES" ]; then
   SERVICES=`find . -maxdepth 2 -name Dockerfile | sed 's#./\(.*\)/Dockerfile#\1#'`
fi;

for service in $SERVICES; do
    DOCKERTAG=${PREFIXTAG}$service:$BUILDTAG
    cd $service
    echo "### Building service $service with tag $DOCKERTAG"
    docker build -t $DOCKERTAG .
    cd -
done