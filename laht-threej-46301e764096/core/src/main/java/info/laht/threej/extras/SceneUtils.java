/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras;

import info.laht.threej.core.Geometry;
import info.laht.threej.core.Object3D;
import info.laht.threej.materials.Material;
import info.laht.threej.math.Matrix4d;
import info.laht.threej.objects.Group;
import info.laht.threej.objects.Mesh;
import info.laht.threej.scenes.Scene;
import java.util.List;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/extras/SceneUtils.js
 * @author laht
 */
public final class SceneUtils {
    
    private SceneUtils() {
        
    }
    
    public static Group createMulitMaterialObject(Geometry geometry, List<Material> materials) {
        Group group = new Group();
        for (int i = 0; i < materials.size(); i++) {
            group.add(new Mesh(geometry, materials.get(i)));
        }
        return group;
    }
    
    public static void detach(Object3D child, Scene scene, Object3D parent) {
        child.applyMatrix(parent.matrixWorld);
        parent.remove(child);
        scene.add(child);
    }
    
    public static void attach(Object3D child, Scene scene, Object3D parent) {
        
        Matrix4d matrixWorldInverse = new Matrix4d();
        matrixWorldInverse.getInverse(parent.matrixWorld);
        child.applyMatrix(matrixWorldInverse);
        
        scene.remove(child);
        parent.add(child);
        
    }
    
}
