/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.Camera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author laht
 */
public class LOD extends Object3D {
    
    public final String type = "LOD";

    private final List<Level> levels;

    public LOD() {
        this.levels = new ArrayList<>();
    }

    public void addLevel(Object3D object, double distance) {
        distance = Math.abs(distance);

        for (int i = 1, l = levels.size(); i < l; i++) {
            if (distance < levels.get(i).distance) {
                break;
            }
        }

        levels.add(1, new Level(object, distance));
        add(object);

    }

    public Object3D getObjectForDistance(double distance) {

        int i;
        for (i = 0; i < levels.size(); i++) {
            if (distance < levels.get(i).distance) {
                break;
            }
        }

        return levels.get(i - 1).object;

    }

    @Override
    public void raycast(RayCaster rayCaster, List<RayCastHit> intersects) {
        Vector3d matrixPosition = new Vector3d();
        matrixPosition.setFromMatrixPosition(matrixWorld);
        double distance = rayCaster.ray.origin.distanceTo(matrixPosition);
        getObjectForDistance(distance).raycast(rayCaster, intersects);
    }

    public void update(Camera camera) {
        Vector3d v1 = new Vector3d();
        Vector3d v2 = new Vector3d();

        if (levels.size() > 1) {
            v1.setFromMatrixPosition(camera.matrixWorld);
            v2.setFromMatrixPosition(matrixWorld);

            levels.get(0).object.visible = true;

            double distance = v1.distanceTo(v2);
            int i;
            for (i = 1; i < levels.size(); i++) {

                if (distance >= levels.get(i).distance) {

                    levels.get(i - 1).object.visible = false;
                    levels.get(i).object.visible = true;
                    
                } else {
                    break;
                }
            }
            
            for ( ; i < levels.size(); i++) {
                levels.get(i).object.visible = false;
            }
            
        }

    }
    
    public LOD copy(LOD source) {
        super.copy(source, false);
        
        for (Level level : levels) {
            addLevel(level.object.copy(), level.distance);
        }
        
        return this;
        
    }

    public static class Level {

        private Object3D object;
        private double distance;

        public Level(Object3D object, double distance) {
            this.object = object;
            this.distance = distance;
        }

    }

}
