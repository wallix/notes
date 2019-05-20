#! /bin/bash -e

export PREFIXTAG="notes-"

if [ -z "${BUILDTAG}" ]; then
    echo "Cannot push images: Missing BUILDTAG in environment"
    exit 1
fi

if [ -z "$SERVICES" ]; then
   SERVICES=`find . -maxdepth 2 -name Dockerfile | sed 's#./\(.*\)/Dockerfile#\1#'`
fi;

for service in $SERVICES; do
    DOCKERTAG=${PREFIXTAG}$service:$BUILDTAG
    REMOTETAG=gcr.io/peps-146814/$DOCKERTAG
    echo "### Pushing $DOCKERTAG to $REMOTETAG"
    docker tag $DOCKERTAG $REMOTETAG
    docker push $REMOTETAG
done
