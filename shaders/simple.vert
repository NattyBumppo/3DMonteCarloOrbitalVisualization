attribute float size;
attribute vec3 customColor;
varying vec3 vColor;

void main() {
    float minSize = 2.0;
    float maxSize = 15.0;

    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    float pointSize = size * ( 1000.0 / -mvPosition.z );
    if (pointSize < minSize)
    {
        pointSize = minSize;
    }
    else if (pointSize > maxSize)
    {
        pointSize = maxSize;
    }

    gl_PointSize = pointSize;
    // gl_PointSize = size * ( 1000.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}