/**
 * Esporta il dettaglio retributivo per i dipendenti e secondo i parametri specificati.
 * 
 * @param {Number} idditta
 * @param {Date}   periododal	 		il periodo a partire dal quale ottenere i dati
 * @param {Date}   periodoal 	 		il periodo sino al quale ottenere i dati
 * @param {Number} idscopo 		 		l'identificato della riclassificazione per la quale ottenere i dati
 * @param {Array}  [employeesToExport]  un'array contenente i codici dei lavoratori da esportare
 * @param {String} [fieldsToExport] 	una stringa contenente i nomi dei campi da esportare, separati da virgola
 * @param {Array}  [riclassificazioni]  un'array contenente gli ID delle riclassificazioni da esportare
 * @param {String} [template] 			il nome del template excel da utilizzare per l'esportazione
 * 
 * @return JSDataset
 * 
 * @properties={typeid:24,uuid:"99A1D49E-15AE-42F2-AB24-288F930A5288"}
 */
function getDettaglioRetributivo(idditta, periododal, periodoal, idscopo, employeesToExport, fieldsToExport, riclassificazioni,template)
{
	var sqlQuery = "SELECT ";
	if(fieldsToExport)
		sqlQuery += fieldsToExport;
	else
		sqlQuery += "*";
		
	sqlQuery += " FROM [dbo].[HRF_Report_Esp](?,?,?) WHERE idScopo = ?";
	
	if(employeesToExport && employeesToExport.length > 0)
		sqlQuery += " AND Codice IN (" + employeesToExport.join(', ') + ")";
	
	if(riclassificazioni && riclassificazioni.length > 0)
		sqlQuery += " AND idRiclassificazione IN (" + riclassificazioni.join(', ') + ")";
	
	sqlQuery += " ORDER BY Nominativo, Codice, Periodo, OrdineScopo, OrdineSezione, CodDettaglio";

	return databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR), sqlQuery, [idditta, periododal.getFullYear() * 100 + periododal.getMonth() + 1, periodoal.getFullYear() * 100 + periodoal.getMonth() + 1, idscopo],-1)
}

/**
 * @param {Boolean} localFile
 * @param {Number} employerID
 * @param atDate
 * @param employeesToExport
 * @param {String} fileName
 * @param {Array<byte>} template
 *  
 * @properties={typeid:24,uuid:"A755D4E4-5C14-4C8A-AC54-8B0DB56F9CEE"}
 */
function exportPersonalData(localFile, employerID, atDate, employeesToExport, fileName, template)
{
	/** type {Array<String>}*/
	var cols = [
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'CodiceFiscale'
				, 'Sesso'
				, 'Nascita_Data'
				, 'Nascita_Comune'
				, 'Nascita_Provincia'
				, 'Nascita_Cap'
				, 'Nascita_Stato'
				, 'Cittadinanza'
				, 'R_Indirizzo'
				, 'R_Comune'
				, 'R_Provincia'
				, 'R_Cap'
				, 'DF_Indirizzo'
				, 'DF_Comune'
				, 'DF_Provincia'
				, 'DF_Cap'
				];
	
	var _sql = "SELECT " + cols.join(', ') + " " +
			   "FROM \
				 	[dbo].[HRF_Report_Lav_DatiAnagrafici](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
	
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR), _sql, [employerID,atDate], -1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Dati Anagrafici', template, arr)
	
	_ds.removeRow(-1);
	
	return output;
}

/** 
 * @param {Boolean} localFile
 * @param {Number} employerID
 * @param atDate
 * @param employeesToExport
 * @param {String} fileName
 * @param {Array<byte>} template
 *  
 * @properties={typeid:24,uuid:"35AE7985-4C8F-4A2E-93F0-B81B94FC693A"}
 */
function exportOtherPersonalData(localFile, employerID, atDate, employeesToExport, fileName, template)
{
	var cols =
			[
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'StatoCivile'
				, 'TitoloStudio'
				, 'TitoloDiStudio'
				, 'DettaglioTitoloDiStudio'
				, 'SpecializzazioneTitoloDiStudio'
			];
			
	var _sql = "SELECT " + cols.join(', ') + " " +
			   "FROM \
					[dbo].[HRF_Report_Lav_AltriDatiAnagrafici](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
	
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerID,atDate],-1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Altri Dati Anagrafici', template, arr)
	
	_ds.removeRow(-1);
	
	return output;
}

/**
 * @properties={typeid:24,uuid:"81A6C670-AC35-4F72-8E10-DA5502ABDAC2"}
 */
function exportDocumentsData(localFile, employerdID, atDate, employeesToExport, fileName, template)
{
	var _sql = "SELECT * FROM [dbo].[HRF_Report_Lav_Documenti](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
	
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerdID,atDate],-1);
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Documenti', template);

	_ds.removeRow(-1);
	
	return output;
}

/**
 * @param {Boolean} localFile
 * @param {Number} employerID
 * @param atDate
 * @param employeesToExport
 * @param {String} fileName
 * @param {Array<byte>} template
 * * 
 * @properties={typeid:24,uuid:"A82BC7DE-E79C-479C-A0D1-239D8B0B33F5"}
 */
function exportContactsData(localFile, employerID, atDate, employeesToExport, fileName, template)
{
	var cols =
			[
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'CodTipoRecapito'
				, 'TipoRecapito'
				, 'Valore'
			];
	
	var _sql = "SELECT " + cols.join(', ') + " " +
	 		   "FROM [dbo].[HRF_Report_Lav_Riferimenti](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
	
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerID,atDate],-1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Riferimenti', template, arr);
	
	_ds.removeRow(-1);
	
	return output;
}

/**
 * @properties={typeid:24,uuid:"DE93A33D-95AD-43A0-ACF5-553F2A83B448"}
 */
function exportContractData(localFile, employerdID, atDate, employeesToExport, fileName, template)
{
	var cols = 
			[
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'Assunzione'
				, 'AssunzioneConvenzionale'
				, 'AnzContributiva'
				, 'AnzMalattia'
				, 'AnzFerie'
				, 'Cessazione'
				, 'MotivoCessazione'
				, 'CategoriaProtetta'
				, 'CategoriaParticolare'
				, 'DataScadenzaContratto'
				, 'TipoRapporto'
				, 'CodContratto'
				, 'Contratto'
				, 'CodQualifica'
				, 'Qualifica'
				, 'Livello'
				, 'PPT'
			];
			
	var _sql = "SELECT " + cols.join(', ') + " " +
				"FROM [dbo].[HRF_Report_Lav_Rapporto](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
		
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerdID,atDate],-1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Rapporto di Lavoro', template,arr);
	
	_ds.removeRow(-1);
	
	return output;
}

/**
 * @properties={typeid:24,uuid:"6C30794D-5AC0-457D-84FA-DC405AA81F11"}
 */
function exportClassificationsData(localFile, employerdID, atDate, employeesToExport, fileName, template)
{
	var cols =
			[
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'CodSedeLavoro'
				, 'SedeLavoro'
				, 'CodCentroCosto'
				, 'CentroCosto'
				, 'CodRaggruppamento1'
				, 'Raggruppamento1'
				, 'CodRaggruppamento2'
				, 'Raggruppamento2'
				, 'CodRaggContabile'
				, 'RaggContabile'
				, 'CodGruppoOperativo'
				, 'GruppoOperativo'
			];
	
	var _sql = "SELECT " + cols.join(', ') + " " +
				"FROM [dbo].[HRF_Report_Lav_Classificazioni](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
		
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerdID,atDate],-1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'Classificazioni', template, arr);
	
	_ds.removeRow(-1);
	
	return output;
}

/**
 * @properties={typeid:24,uuid:"FC9E66A4-2668-4D16-948A-FFF4FB698DB2"}
 */
function exportInailData(localFile, employerdID, atDate, employeesToExport, fileName, template)
{
	var cols = 
			[
				  'CodDitta'
				, 'RagioneSociale'
				, 'PosInps'
				, 'CodDip'
				, 'Cognome'
				, 'Nome'
				, 'Facchino'
				, 'SNAreaDirigInail'
				, 'PosizioneInail'
				, 'Pat'
				, 'ControCodice'
				, 'VoceTariffa'
				, 'GestInquadramento'
				, 'Inquadramento'
				, 'PercPonderazione'
				, 'SNSilicosi'
			];
	
	var _sql = "SELECT " + cols.join(', ') + " " +
				"FROM [dbo].[HRF_Report_Lav_Inail](?,?)";
	
	if(employeesToExport && employeesToExport.length > 0)
		_sql += " WHERE idLavoratore IN (" + employeesToExport.join(', ') + ") ";
		
		_sql += "ORDER BY\
				 	 Cognome\
				 	,Nome";
		
	var _ds = databaseManager.getDataSetByQuery(globals.getSwitchedServer(globals.Server.MA_HR),_sql,[employerdID,atDate],-1)
	/**  @type {Array<String>} */
	var arr = cols.map(function(item){ return item.toLowerCase(); })
	var output = globals.xls_export(_ds, fileName, localFile, false, false, null, 'INAIL', template, arr);
	
	_ds.removeRow(-1);
	
	return output;
}
