#version 150

uniform sampler2DRect tex0;

in vec2 texCoordVarying;

out vec4 outputColor;

float length(vec3 vec) {
    return sqrt(vec.r*vec.r+vec.g*vec.g+vec.b*vec.b);
}

// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

bool matchesPink(vec4 color, vec2 coord) {
    float lengthColor = length(color.rgb);
    vec3 res = color.rgb/lengthColor;
    return lengthColor > 0.3 && res.g < 0.44 && res.b < 0.8 && res.r < 0.8 && res.b> 0.5 && res.r>0.5;
}

float getPink(vec4 color) {
    float lengthColor = length(color.rgb);
    vec3 norm = color.rgb/lengthColor;
    return norm.r+norm.b*0.6-norm.g*0.8;
}

bool neighborIsAlsoPink(float centerPinkVal, vec2 coord) {
    float pinkish = getPink(texture(tex0, coord));
    if(pinkish > centerPinkVal) return true; // neighbor is more pink
    float res = centerPinkVal*0.5+(centerPinkVal-pinkish)*5;
    return res < 0.5;
}

bool matchesPinkButNeighborsDont(vec4 color, vec2 coord) {
    float grey = getPink(color); // how pink is this pixel
    if(grey < 0.5) return false;
    vec3 hsv = rgb2hsv(color.rgb);
    if(hsv.x < 0.75) return false;
    if(hsv.y < 0.3) return false;
    if(hsv.z < 0.1 || hsv.z > 0.97) return false;
    float margin = 8;
    if(neighborIsAlsoPink(grey, vec2(coord.x+margin, coord.y))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x+margin*0.5, coord.y+margin*0.5))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x+margin*0.5, coord.y-margin*0.5))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x, coord.y+margin))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x, coord.y-margin))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x-margin, coord.y))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x-margin*0.5, coord.y+margin*0.5))) return false;
    if(neighborIsAlsoPink(grey, vec2(coord.x-margin*0.5, coord.y-margin*0.5))) return false;
    return true;
}

void main()
{
    // Get color values from the background and foreground
    vec4 back = texture(tex0, texCoordVarying);
    if(matchesPinkButNeighborsDont(back, texCoordVarying)) {
        outputColor = vec4(1,1,1,1);
    } else {
        outputColor = vec4(0,0,0,1);
    }
}

