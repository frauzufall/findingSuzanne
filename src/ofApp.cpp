#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){

    ofDirectory output("res5-03");
    ofDirectory input("/home/random/Downloads/suzanne/GP017588-no-to");
//    ofDirectory input("/home/random/Downloads/suzanne/190706_search_for_missing_person_W-v-YNRBOyk_1080p");

    shader.load("shadersGL3/shader");

    input.sort();
    vector<ofFile> stills = input.getFiles();
    if(!output.exists()) output.create(true);

    cout << stills.size() << endl;
    for(int i = 0; i < stills.size(); i++) {
        ofImage img;
        img.load(stills.at(i).getAbsolutePath());
        if(img.isAllocated()) {
            processStill(img, i, output.getAbsolutePath());
        } else {
            cout << "[ERROR] could not load " << stills.at(i).getAbsolutePath() << endl;
        }
    }

    ofExit();
}

void ofApp::processStill(ofImage img, int count, string output) {
    cout << count << endl;

    int w = img.getWidth();
    int h = img.getHeight();

    ofSetColor(255);
    ofFbo fbo;
    fbo.allocate(w, h);

    //run shader
    fbo.begin();
    shader.begin();
    img.draw(0, 0);
    shader.end();
    fbo.end();

    ofPixels pixels;
    fbo.getTexture().readToPixels(pixels);

    bool found = false;

    //prepare result image
    ofSetColor(100);
    ofFbo res;
    res.allocate(w, h);
    res.begin();
    img.draw(0,0);
    res.end();

    //check if it detected anything
    ofSetColor(255);
    for(int x = 0; x < w; x++){
        for(int y = 0; y < h; y++){
            if(pixels.getColor(x,y).r > 0) {
                //detected something, draw area to result image in full brightness
                found = true;
                int margin = 20;
                res.begin();
                img.drawSubsection(x-margin, y-margin, margin*2, margin*2, x-margin, y-margin);
                res.end();
            }
        }
    }

    // if it detected something, save result image
    if(found) {
        ofPixels resPixels;
        res.getTexture().readToPixels(resPixels);
        ofImage resOut = ofImage();
        resOut.setFromPixels(resPixels);
        ofImage out = ofImage();
        out.setFromPixels(pixels);
        cout << output + "/" + ofToString(count, 5, '0') + ".jpg" << endl;
//        img.save(output + "/" + ofToString(count, 5, '0') + ".jpg", OF_IMAGE_QUALITY_BEST);
        resOut.save(output + "/" + ofToString(count, 5, '0') + "_marked.jpg", OF_IMAGE_QUALITY_BEST);
//        out.save(output + "/" + ofToString(count, 5, '0') + "_res.jpg", OF_IMAGE_QUALITY_BEST);
    }


}
