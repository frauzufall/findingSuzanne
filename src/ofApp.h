#pragma once

#include "ofMain.h"

class ofApp : public ofBaseApp{
	public:
		
    void setup();

    ofShader shader;

    void processStill(ofImage img, int count, string out);
};
