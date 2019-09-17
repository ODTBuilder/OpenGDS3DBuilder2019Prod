/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.textures;

import java.awt.image.BufferedImage;
import java.util.List;

/**
 *
 * @author laht
 */
public class CompressedTexture extends Texture {

    public final Image image;
    
    public CompressedTexture(List<BufferedImage> mipmaps, Integer width, Integer height, Integer format, Integer type, Integer mapping, Integer wrapS, Integer wrapT, Integer magFilter, Integer minFilter,  Integer anisotropy, Integer encoding) {
        super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    
        this.image = new Image(width, height);
        this.mipmaps = mipmaps;
        
        this.flipY = false;
        
        this.generateMipmaps = false;
    
    }

    public static class Image {

        private final int width, height;

        public Image(int width, int height) {
            this.width = width;
            this.height = height;
        }

        public int getWidth() {
            return width;
        }

        public int getHeight() {
            return height;
        }

    }

}
