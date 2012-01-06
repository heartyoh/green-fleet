package com.heartyoh.util.fileupload;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.fileupload.FileItemStream;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Multipart file for Commons File Upload <code>FileItemStream</code>s.
 * 
 * @author Tom van Zummeren
 */
public class CommonsStreamMultipartFile implements MultipartFile {

	private String name;

	private String originalFilename;

	private String contentType;

	private byte[] fileContent;

	/**
	 * Constructs a new <code>CommonsStreamMultipartFile</code> based on a
	 * Commons <code>FileItemStream</code>.
	 * 
	 * @param fileItemStream
	 *            stream to base this multipart file on
	 * @throws java.io.IOException
	 *             when error occurs while opening the stream
	 */
	public CommonsStreamMultipartFile(FileItemStream fileItemStream) throws IOException {
		name = fileItemStream.getFieldName();
		originalFilename = fileItemStream.getName();
		contentType = fileItemStream.getContentType();
		fileContent = FileCopyUtils.copyToByteArray(fileItemStream.openStream());
	}

	/**
	 * {@inheritDoc}
	 */
	public String getName() {
		return name;
	}

	/**
	 * {@inheritDoc}
	 */
	public String getOriginalFilename() {
		return originalFilename;
	}

	/**
	 * {@inheritDoc}
	 */
	public String getContentType() {
		return contentType;
	}

	/**
	 * {@inheritDoc}
	 */
	public boolean isEmpty() {
		return fileContent.length == 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public long getSize() {
		return fileContent.length;
	}

	/**
	 * {@inheritDoc}
	 */
	public byte[] getBytes() throws IOException {
		return fileContent;
	}

	/**
	 * {@inheritDoc}
	 */
	public InputStream getInputStream() throws IOException {
		return new ByteArrayInputStream(fileContent);
	}

	/**
	 * {@inheritDoc}
	 */
	public void transferTo(File destination) throws IOException, IllegalStateException {
		throw new UnsupportedOperationException("Not supported by the Google App Engine");
	}
}