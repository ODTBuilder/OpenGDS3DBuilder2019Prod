/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras;

import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class CameraView implements Serializable {

    public final int fullWidth, fullHeight;
    public final int offsetX, offsetY;
    public final int width, height;

    public CameraView(int fullWidth, int fullHeight, int offsetX, int offsetY, int width, int height) {
        this.fullWidth = fullWidth;
        this.fullHeight = fullHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
    }
    
    public CameraView copy() {
        return new CameraView(fullWidth, fullHeight, offsetX, offsetY, width, height);
    }

}
