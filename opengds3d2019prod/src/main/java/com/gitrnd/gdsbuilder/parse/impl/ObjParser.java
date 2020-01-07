package com.gitrnd.gdsbuilder.parse.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.geotools.referencing.GeodeticCalculator;

import de.javagl.obj.FloatTuple;
import de.javagl.obj.Obj;
import de.javagl.obj.ObjFace;
import de.javagl.obj.ObjGroup;
import de.javagl.obj.ObjUtils;
import de.javagl.obj.Objs;

public class ObjParser {

	double maxHeight;

	public ObjParser(double originMaxHeight) {
		this.maxHeight = originMaxHeight;
	}

	public Obj combineObj(Obj originObj, Obj createObj, double centerXedit, double centerYedit, double centerXtile,
			double centerYtile) {

		GeodeticCalculator gc = new GeodeticCalculator();
		gc.setStartingGeographicPoint(centerXtile, centerYedit);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double xDistance = gc.getOrthodromicDistance();
		if (centerXtile > centerXedit) {
			xDistance = -xDistance;
		}
		gc.setStartingGeographicPoint(centerXedit, centerYtile);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double yDistance = gc.getOrthodromicDistance();
		if (centerYtile > centerYedit) {
			yDistance = -yDistance;
		}

		Obj newObjedt = Objs.create();
		// vertex
		for (int v = 0; v < createObj.getNumVertices(); v++) {
			FloatTuple vertex = createObj.getVertex(v);
			newObjedt.addVertex((float) (vertex.getX() + xDistance), (float) (vertex.getY() + yDistance),
					vertex.getZ());
			if (vertex.getZ() > maxHeight) {
				maxHeight = vertex.getZ();
			}
		}
		// texCoordIndices
		for (int t = 0; t < createObj.getNumVertices(); t++) {
			newObjedt.addTexCoord(createObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < createObj.getNumVertices(); n++) {
			newObjedt.addNormal(createObj.getNormal(n));
		}
		List<String> groupNamesEdt = new ArrayList<>();
		int numGroupsEdt = createObj.getNumGroups();
		for (int g = 0; g < numGroupsEdt; g++) {
			ObjGroup group = createObj.getGroup(g);
			groupNamesEdt.add(group.getName());
			for (int f = 0; f < group.getNumFaces(); f++) {
				ObjFace face = group.getFace(f);
				Set<String> activatedGroupNames = createObj.getActivatedGroupNames(face);
				if (activatedGroupNames != null) {
					newObjedt.setActiveGroupNames(activatedGroupNames);
				}
				String activatedMaterialGroupName = createObj.getActivatedMaterialGroupName(face);
				if (activatedMaterialGroupName != null) {
					newObjedt.setActiveMaterialGroupName(activatedMaterialGroupName);
				}
				newObjedt.addFace(face);
			}
		}

		Obj combinedObj = Objs.create();
		ObjUtils.add(originObj, combinedObj);
		ObjUtils.add(newObjedt, combinedObj);

		return combinedObj;
	}

	public Obj modifyObj(Obj originObj, Obj modifyObj, String featureId, double centerXedit, double centerYedit,
			double centerXtile, double centerYtile) {

		GeodeticCalculator gc = new GeodeticCalculator();
		gc.setStartingGeographicPoint(centerXtile, centerYedit);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double xDistance = gc.getOrthodromicDistance();
		if (centerXtile > centerXedit) {
			xDistance = -xDistance;
		}
		gc.setStartingGeographicPoint(centerXedit, centerYtile);
		gc.setDestinationGeographicPoint(centerXedit, centerYedit);
		double yDistance = gc.getOrthodromicDistance();
		if (centerYtile > centerYedit) {
			yDistance = -yDistance;
		}

		Obj newModifytObj = Objs.create();
		// vertex
		for (int v = 0; v < modifyObj.getNumVertices(); v++) {
			FloatTuple vertex = modifyObj.getVertex(v);
			newModifytObj.addVertex((float) (vertex.getX() + xDistance), (float) (vertex.getY() + yDistance),
					vertex.getZ());
			if (vertex.getZ() > maxHeight) {
				maxHeight = vertex.getZ();
			}
		}
		// texCoordIndices
		for (int t = 0; t < modifyObj.getNumVertices(); t++) {
			newModifytObj.addTexCoord(modifyObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < modifyObj.getNumVertices(); n++) {
			newModifytObj.addNormal(modifyObj.getNormal(n));
		}
		List<String> groupNamesEdt = new ArrayList<>();
		int numGroupsEdt = modifyObj.getNumGroups();
		for (int g = 0; g < numGroupsEdt; g++) {
			ObjGroup group = modifyObj.getGroup(g);
			groupNamesEdt.add(group.getName());
			for (int f = 0; f < group.getNumFaces(); f++) {
				ObjFace face = group.getFace(f);
				Set<String> activatedGroupNames = modifyObj.getActivatedGroupNames(face);
				if (activatedGroupNames != null) {
					newModifytObj.setActiveGroupNames(activatedGroupNames);
				}
				String activatedMaterialGroupName = modifyObj.getActivatedMaterialGroupName(face);
				if (activatedMaterialGroupName != null) {
					newModifytObj.setActiveMaterialGroupName(activatedMaterialGroupName);
				}
				newModifytObj.addFace(face);
			}
		}

		Obj newOriginObj = Objs.create();
		// vertex
		for (int v = 0; v < originObj.getNumVertices(); v++) {
			newOriginObj.addVertex(originObj.getVertex(v));
		}
		// texCoordIndices
		for (int t = 0; t < originObj.getNumVertices(); t++) {
			newOriginObj.addTexCoord(originObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < originObj.getNumVertices(); n++) {
			newOriginObj.addNormal(originObj.getNormal(n));
		}
		List<String> groupNames = new ArrayList<>();
		int numGroups = originObj.getNumGroups();
		for (int g = 0; g < numGroups; g++) {
			ObjGroup group = originObj.getGroup(g);
			if (!group.getName().equals(featureId)) {
				groupNames.add(group.getName());
				for (int f = 0; f < group.getNumFaces(); f++) {
					ObjFace face = group.getFace(f);
					Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
					if (activatedGroupNames != null) {
						newOriginObj.setActiveGroupNames(activatedGroupNames);
					}
					String activatedMaterialGroupName = originObj.getActivatedMaterialGroupName(face);
					if (activatedMaterialGroupName != null) {
						newOriginObj.setActiveMaterialGroupName(activatedMaterialGroupName);
					}
					newOriginObj.addFace(face);
				}
			}
		}

		Obj combinedObj = Objs.create();
		ObjUtils.add(newOriginObj, combinedObj);
		ObjUtils.add(newModifytObj, combinedObj);

		return combinedObj;
	}

	public Obj deleteObj(Obj originObj, String featureId) {

		Obj newOriginObj = Objs.create();
		// vertex
		for (int v = 0; v < originObj.getNumVertices(); v++) {
			newOriginObj.addVertex(originObj.getVertex(v));
		}
		// texCoordIndices
		for (int t = 0; t < originObj.getNumVertices(); t++) {
			newOriginObj.addTexCoord(originObj.getTexCoord(t));
		}
		// normalIndex
		for (int n = 0; n < originObj.getNumVertices(); n++) {
			newOriginObj.addNormal(originObj.getNormal(n));
		}
		List<String> groupNames = new ArrayList<>();
		int numGroups = originObj.getNumGroups();
		for (int g = 0; g < numGroups; g++) {
			ObjGroup group = originObj.getGroup(g);
			if (!group.getName().equals(featureId)) {
				groupNames.add(group.getName());
				for (int f = 0; f < group.getNumFaces(); f++) {
					ObjFace face = group.getFace(f);
					Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
					if (activatedGroupNames != null) {
						newOriginObj.setActiveGroupNames(activatedGroupNames);
					}
					String activatedMaterialGroupName = originObj.getActivatedMaterialGroupName(face);
					if (activatedMaterialGroupName != null) {
						newOriginObj.setActiveMaterialGroupName(activatedMaterialGroupName);
					}
					newOriginObj.addFace(face);
				}
			}
		}
		return newOriginObj;
	}

	public double getMaxHeight() {
		return maxHeight;
	}

	public void setMaxHeight(double maxHeight) {
		this.maxHeight = maxHeight;
	}

}
