/**
 * 
 */
package com.heartyoh.servlet.filter;

import java.io.IOException;
import java.sql.SQLException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import com.heartyoh.datasource.GfConnection;
import com.heartyoh.datasource.GfDataSource;

/**
 * @author jhnam
 */
public class DatasourceFilter implements Filter {

	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {

		try {
			chain.doFilter(request, response);

		} catch (IOException ioe) {
			throw ioe;

		} catch (ServletException se) {
			throw se;

		} finally {
			// 모두 처리한 후 request에서 gf_connection attribute를 뽑아 Connection을 close해 줌
			if (request.getAttribute(GfDataSource.REQUEST_CONNECTION_ATTR_NAME) != null) {
				GfConnection conn = (GfConnection) request.getAttribute(GfDataSource.REQUEST_CONNECTION_ATTR_NAME);
				try {
					conn.closeConnection();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

}
