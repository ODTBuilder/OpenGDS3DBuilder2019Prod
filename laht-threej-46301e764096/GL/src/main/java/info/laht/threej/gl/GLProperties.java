/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import info.laht.threej.core.Object3D;
import info.laht.threej.interfaces.Identifiable;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 *
 * @author laht
 */
public class GLProperties {

    private final Map<UUID, Map<String, Object>> properties;

    public GLProperties() {
        this.properties = new HashMap<>();
    }

    public Map<String, Object> get(Identifiable object) {

        UUID uuid = object.getUuid();
        Map<String, Object> map = properties.get(uuid);

        if (map == null) {
            map = new HashMap<>();
            properties.put(uuid, map);
        }

        return map;

    }

    public void delete(Identifiable object) {
        properties.remove(object.getUuid());
    }

    public void clear() {
        properties.clear();
    }

}
