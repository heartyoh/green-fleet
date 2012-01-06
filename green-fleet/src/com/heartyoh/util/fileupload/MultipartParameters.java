package com.heartyoh.util.fileupload;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

/**
 * Container for both simple string parameters as multi part file parameters
 * retrieved from a multipart http request.
 * 
 * @author Tom van Zummeren
 */
class MultipartParameters {

	private MultiValueMap<String, MultipartFile> multipartFileParameters;

	private Map<String, String[]> stringParameters;

	private Map<String, String> contentTypes;

	/**
	 * Constructs a new {@code ParametersAndFiles}.
	 */
	public MultipartParameters() {
		multipartFileParameters = new LinkedMultiValueMap<String, MultipartFile>();
		stringParameters = new HashMap<String, String[]>();
		contentTypes = new HashMap<String, String>();
	}

	/**
	 * Adds a {@code MultipartFile} as a value to a multi value map.
	 * 
	 * @param name
	 *            name of the file
	 * @param file
	 *            file to add as a value
	 */
	public void addMultipartFileParameter(String name, MultipartFile file) {
		List<MultipartFile> files = multipartFileParameters.get(name);
		if (files == null) {
			files = new ArrayList<MultipartFile>();
		}
		files.add(file);
		multipartFileParameters.put(name, files);
	}

	/**
	 * Adds a string to an array of strings stored as a value with a certain key
	 * within the map. If the key does not yet exist, it is created with a
	 * string array containing the value string.
	 * 
	 * @param name
	 *            key of the value to add
	 * @param value
	 *            value to add to the array
	 */
	public void addStringParameter(String name, String value) {
		String[] existingValues = stringParameters.get(name);
		String[] newValues = { value };
		if (existingValues != null) {
			newValues = addToArray(existingValues, value);
		}
		stringParameters.put(name, newValues);
	}

	/**
	 * 
	 * 
	 * @param name
	 *            key of the value to add
	 * @param value
	 *            value to add to the array
	 */
	public void addContentType(String name, String value) {
		contentTypes.put(name, value);
	}

	/**
	 * Adds a string to an array of strings by creating a new array with a
	 * length one bigger than the original.
	 * 
	 * @param array
	 *            array to add string to
	 * @param string
	 *            string to add
	 * @return new array containing the old array and the new string
	 */
	private String[] addToArray(String[] array, String string) {
		String[] newArray = new String[array.length + 1];
		System.arraycopy(array, 0, newArray, 0, array.length);
		newArray[newArray.length - 1] = string;
		return newArray;
	}

	/**
	 * Gets a map of all added multipart file parameters.
	 * 
	 * @return multipart file parameters as map
	 */
	public MultiValueMap<String, MultipartFile> getMultipartFileParameters() {
		return multipartFileParameters;
	}

	/**
	 * Gets a map of all added string parameters.
	 * 
	 * @return string parameters as map
	 */
	public Map<String, String[]> getStringParameters() {
		return stringParameters;
	}

	/**
	 * 
	 * 
	 * @return string parameters as map
	 */
	public Map<String, String> getContentTypes() {
		return contentTypes;
	}
}