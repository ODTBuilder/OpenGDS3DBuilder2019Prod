/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import java.util.HashMap;
import java.util.Map;
import org.lwjgl.opengles.GLES;
import org.lwjgl.opengles.GLES20;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author laht
 */
public class GLExtensions {

    private final static Logger LOG = LoggerFactory.getLogger(GLExtensions.class);

    private final Map<String, Integer> extensions;

    public GLExtensions() {
        this.extensions = new HashMap<>();
    }

    public int get(String name) {
        
        if (extensions.containsKey(name)) {

            return extensions.get(name);

        }

        Integer extension = null;

        if (extension == null) {

            LOG.warn("{} extension not supported.", name);

        }

        extensions.put(name, extension);

        return extension;
    }

}
