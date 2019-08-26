/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.util.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Sprite extends Object3D {
    
    public final String type = "Sprite";

    public Material material;

    public Sprite() {
        this(new SpriteMaterial());
    }

    public Sprite(Material material) {
        this.material = material;
    }

    @Override
    public void raycast(RayCaster raycaster, List<RayCastHit> intersects) {
        Vector3d matrixPosition = new Vector3d();
        matrixPosition.setFromMatrixPosition(matrixWorld);

        double distanceSq = raycaster.ray.distanceSqToPoint(matrixPosition);
        double guessSizeSq = this.scale.x() * this.scale.y() / 4;

        if (distanceSq > guessSizeSq) {
            return;
        }
        
        RayCastHit hit = new RayCastHit();
        hit.object = this;
        hit.distance = Math.sqrt(distanceSq);
        hit.point = position;
        
        intersects.add(hit);
    }
    
    @Override
    public Sprite copy() {
        return (Sprite) new Sprite(material).copy(this);
    }

}
