/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import info.laht.threej.core.BufferAttribute;
import info.laht.threej.core.BufferGeometry;
import info.laht.threej.core.Object3D;
import info.laht.threej.materials.LineBasicMaterial;
import info.laht.threej.math.Box3d;
import info.laht.threej.math.Color;
import info.laht.threej.math.Vector3d;
import info.laht.threej.objects.LineSegments;
import java.util.List;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 *
 * @author laht
 */
public class BoxHelper extends LineSegments {
    
    public BoxHelper(Object3D object) {
        this(object, new Color().set("#ffff00"));
    }
    
    public BoxHelper(Object3D object, Color color) {
        super(create(), new LineBasicMaterial(new ImmutablePair<>("color", color)));
        
        update(object);
        
    }
    
    private final Box3d box = new Box3d();
    
    public final void update(Object3D object) {
        
        box.setFromObject(object);

        if (box.isEmpty()) {
            return;
        }

        Vector3d min = box.getMin();
        Vector3d max = box.getMax();

        /*
          5____4
        1/___0/|
        | 6__|_7
        2/___3/
        0: max.x, max.y, max.z
        1: min.x, max.y, max.z
        2: min.x, min.y, max.z
        3: max.x, min.y, max.z
        4: max.x, max.y, min.z
        5: min.x, max.y, min.z
        6: min.x, min.y, min.z
        7: max.x, min.y, min.z
        */

        BufferAttribute position = this.geometry.attributes.get("position");
        List<Number> array = position.array;

//        array[  0 ] = max.x(); array[  1 ] = max.y; array[  2 ] = max.z;
//        array[  3 ] = min.x(); array[  4 ] = max.y; array[  5 ] = max.z;
//        array[  6 ] = min.x(); array[  7 ] = min.y(); array[  8 ] = max.z;
//        array[  9 ] = max.x(); array[ 10 ] = min.y(); array[ 11 ] = max.z;
//        array[ 12 ] = max.x(); array[ 13 ] = max.y; array[ 14 ] = min.z;
//        array[ 15 ] = min.x(); array[ 16 ] = max.y; array[ 17 ] = min.z;
//        array[ 18 ] = min.x(); array[ 19 ] = min.y(); array[ 20 ] = min.z;
//        array[ 21 ] = max.x(); array[ 22 ] = min.y(); array[ 23 ] = min.z;

        position.needsUpdate(true) ;

        this.geometry.computeBoundingSphere();
        
    }
 
    private static BufferGeometry create() {
        BufferGeometry geometry = new BufferGeometry();
        geometry.setIndex(new BufferAttribute.IntBufferAttribute(new int[]{
        
            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 
            
        }, 1));
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(new double[8*3], 3));
        return geometry;
    }
    
}
