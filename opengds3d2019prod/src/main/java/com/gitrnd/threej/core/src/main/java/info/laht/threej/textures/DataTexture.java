/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.textures;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import java.awt.image.BufferedImage;

/**
 *
 * @author laht
 */
public class DataTexture extends Texture {

    public DataTexture(Object data, Integer mapping, Integer wrapS, Integer wrapT, Integer magFilter, Integer minFilter, Integer format, Integer type, Integer anisotropy, Integer encoding) {
        super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

        this.magFilter = magFilter != null ? magFilter : Constants.NearestFilter;
        this.minFilter = minFilter != null ? minFilter : Constants.NearestFilter;

        this.generateMipmaps = false;
        this.flipY = false;
        this.unpackAlignment = 1;

    }

    public static class Image {

        private final Object data;
        private final int width, height;

        public Image(Object data, int width, int height) {
            this.data = data;
            this.width = width;
            this.height = height;
        }

        public Object getData() {
            return data;
        }

        public int getWidth() {
            return width;
        }

        public int getHeight() {
            return height;
        }

    }

}
