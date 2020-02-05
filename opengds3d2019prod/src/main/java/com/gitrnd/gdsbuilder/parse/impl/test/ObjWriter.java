package com.gitrnd.gdsbuilder.parse.impl.test;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import de.javagl.obj.FloatTuple;
import de.javagl.obj.FloatTuples;
import de.javagl.obj.ObjFace;
import de.javagl.obj.ObjFaces;
import de.javagl.obj.ReadableObj;

public class ObjWriter {

	/**
	 * A class that may write an {@link ReadableObj} to a stream.
	 */
	/**
	 * Writes the given {@link ReadableObj} to the given stream. The caller is
	 * responsible for closing the stream.
	 * 
	 * @param input        The {@link ReadableObj} to write.
	 * @param outputStream The stream to write to.
	 * @throws IOException If an IO error occurs.
	 */
	public static void write(ReadableObj input, OutputStream outputStream) throws IOException {
		OutputStreamWriter outputStreamWriter = new OutputStreamWriter(outputStream);
		write(input, outputStreamWriter);
	}

	/**
	 * Writes the given {@link ReadableObj} to the given writer. The caller is
	 * responsible for closing the writer.
	 * 
	 * @param input  The {@link ReadableObj} to write.
	 * @param writer The writer to write to.
	 * @throws IOException If an IO error occurs.
	 */
	public static void write(ReadableObj input, Writer writer) throws IOException {
		// Write the mtl file name
		List<String> mtlFileNames = input.getMtlFileNames();
		if (!mtlFileNames.isEmpty()) {
			writer.write("mtllib ");
			for (int i = 0; i < mtlFileNames.size(); i++) {
				if (i > 0) {
					writer.write(" ");
				}
				writer.write(mtlFileNames.get(i));
			}
			writer.write("\n");
		}

		// Write the vertex- texture coordinate and normal data
		for (int i = 0; i < input.getNumVertices(); i++) {
			FloatTuple vertex = input.getVertex(i);
			writer.write("v " + FloatTuples.createString(vertex) + "\n");
		}
		for (int i = 0; i < input.getNumTexCoords(); i++) {
			FloatTuple texCoord = input.getTexCoord(i);
			writer.write("vt " + FloatTuples.createString(texCoord) + "\n");
		}
		for (int i = 0; i < input.getNumNormals(); i++) {
			FloatTuple normal = input.getNormal(i);
			writer.write("vn " + FloatTuples.createString(normal) + "\n");
		}

		String beforeMaterialGroupName = null;
		boolean skipWritingDefaultGroup = true;
		for (int i = 0; i < input.getNumFaces(); i++) {
			ObjFace face = input.getFace(i);

			Set<String> activatedGroupNames = input.getActivatedGroupNames(face);
			if (activatedGroupNames != null) {
				boolean isDefaultGroup = activatedGroupNames.equals(Collections.singleton("default"));
				if (!skipWritingDefaultGroup || !isDefaultGroup) {
					writer.write("g ");
					for (String activatedGroupName : activatedGroupNames) {
						writer.write(activatedGroupName);
						writer.write(" ");
					}
					writer.write("\n");
					String activatedMaterialGroupName = input.getActivatedMaterialGroupName(face);
					if (activatedMaterialGroupName != null) {
						writer.write("usemtl " + activatedMaterialGroupName + "\n");
						beforeMaterialGroupName = activatedMaterialGroupName;
					} else {
						writer.write("usemtl " + beforeMaterialGroupName + "\n");
					}
				}
				skipWritingDefaultGroup = false;
			}
			String faceString = ObjFaces.createString(face);
			writer.write(faceString + "\n");
		}
		writer.flush();
	}

}
