    /*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import info.laht.threej.core.BufferAttribute;
import info.laht.threej.core.BufferGeometry;
import info.laht.threej.core.InterleavedBufferAttribute;
import info.laht.threej.interfaces.IBufferAttribute;
import info.laht.threej.interfaces.IGeometry;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author laht
 */
public class GLGeometries {

    private final GLProperties properties;
    private final Map<Integer, BufferGeometry> geometries;

    public GLGeometries(GLProperties properties) {
        
        this.properties = properties;
        this.geometries = new HashMap<>();

    }

    public void onGeometryDispose() {

    }

    public void getAttributeBuffer(IBufferAttribute attribute) {

        if (attribute instanceof InterleavedBufferAttribute) {
//            return properties.get(null);
        }

    }

}
