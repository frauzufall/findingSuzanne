#include "ofMain.h"
#include "ofApp.h"

//========================================================================
int main( ){

	ofGLWindowSettings settings;
    settings.setGLVersion(3,2);
    ofCreateWindow(settings);
	ofRunApp(new ofApp());

}
