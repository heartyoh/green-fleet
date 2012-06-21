update 
	vehicle v,
	(
		select 
			vehicle, (effcc_sum/cnt) avg_effcc,	(eco_sum/cnt) eco_index
		from (
			select 
				vehicle, count(vehicle) cnt, 
				sum(effcc) effcc_sum, sum(eco_index) eco_sum  
			from 
				vehicle_run_sum 
			where 
				company = :company and 
				month_date >= :fromDate and 
				month_date <= :toDate 
			group by vehicle
		) vs
	) s	
set
	v.avg_effcc = s.avg_effcc,
	v.eco_index = s.eco_index
where
	v.id = s.vehicle and v.company = :company